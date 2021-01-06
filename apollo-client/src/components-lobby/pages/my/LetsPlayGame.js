import React, { Component, Fragment } from 'react';
import { Checkbox, Row, Col } from 'antd';
import { withRouter } from 'react-router-guard';
import { Query, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { importAll, dateFormat } from "utils";
import { PlatformContext } from "states/context/PlatformContext";
import AuditModal from 'components-lobby/partial/modal/AuditModal'
import { GraphQLEnumType } from 'graphql';
import { AUTH_TOKEN } from "utils/constants";

import { injectIntl, FormattedMessage } from "react-intl";

const DevGamesSortType = new GraphQLEnumType({
  name: "DevGamesSortType",
  values: {
    UPDATETIME: {
      value: 0
    },
    CREATIONTIME: {
      value: 1
    }
  }
})

let projectVisible = false;

const DEVELOPER_GAMESDISPLAY_INFO = gql`
query developerGamesDisplayInfo($sortType:DevGamesSortType!){
  developerGamesDisplayInfo(sortType:$sortType){
    games{
      headGame{
        id
        author
        name
        assetID
        iconURL
        version
        timestamp
        auditInfo{
          auditStatus
          auditResult
          auditReason
          auditQueuePos
          auditUndoPublishReason
          auditUndoPublishDescription
          auditUndoPublishFromVersion
        }
        publicStatus
        lastChangeTime
      }
      versions{
        id
        name
        assetID
        version
        timestamp
        auditInfo{
           auditStatus
           auditResult
           auditReason
           auditQueuePos
           auditUndoPublishReason
           auditUndoPublishDescription
           auditUndoPublishFromVersion
        }
        publicStatus
        lastChangeTime
      }
      myAuth
    }
}
}
`;
// 下架
const PUBLISH_UNDOGAME_GAME = gql`
mutation publishUndoGame($input:PublishUndoGameInput!){
    publishUndoGame(input:$input){
      code
    }
  }
`;

const PUBLISH_GAME = gql`
mutation publishGame($input:PublishGameInput!){
    publishGame(input:$input){
      code
    }
  }
`;
// 撤销审核
const AUDIT_GAME_UNDOBEGIN = gql`
mutation auditGameUndoBegin($gameID:String!,$version:String!){
  auditGameUndoBegin(gameID:$gameID,version:$version){
    code
  }
}
`;
//删除
const DELETE_GAME = gql`
mutation deleteGameVersion($gameID:String!,$version:String!){
  deleteGameVersion(gameID:$gameID,version:$version){
    code
  }
}
`;

const GameTitle = (props) => {
  const gameState = [
    { value: 'IN_AUDIT', state: '审核中' },
    { value: 'UNDISCLOSED', state: '审核已通过-待发布' },
    { value: 'PUBLISHED', state: '已上架' },
    { value: 'CLOSED', state: '已下架' },
    { value: 'REJECTED', state: '审核未通过' }
  ]
  return (
    <div className="letsplay-game-title">
      <Checkbox.Group className="checkbox-group" onChange={props.onChangeStarts}
        defaultValue={["IN_AUDIT", "UNDISCLOSED", "PUBLISHED", "CLOSED", "REJECTED"]}>
        <Row>
          {
            gameState.map((item, index) => {
              return (
                <Col key={item.value}>
                  <Checkbox value={item.value}>{item.state}</Checkbox>
                </Col>
              )
            })
          }
        </Row>
      </Checkbox.Group>
      <div className="update-time">
        <span>{props.arrowUp ? 'Update Time' : 'Creation Time'}</span>
        <div className="update-time-select dropDown-game">
          <div className="update-time-select-icon"><img src={props.imgs} alt='icon' /></div>
          <ul>
            <li className={`${props.arrowUp ? 'active' : ''}`} onClick={() => { props.getUpdateTime('update') }}>Update Time</li>
            <li className={`${props.arrowUp ? '' : 'active'}`} onClick={() => { props.getUpdateTime('creat') }}>Creation Time</li>
          </ul>
        </div>
      </div>
    </div>
  )
}


const GameStateUl = (props) => {
  const { gameInfo, gameVersions, myAuth } = props
  const actionState = props.getGameState(gameInfo)[4];
  // 版本里面已下架的item
  let modalVersions = [];
  if (gameInfo && props.getGameState(gameInfo)[3] === "CLOSED") {
    modalVersions.push(gameInfo);
  }
  if (gameVersions) {
    for (let version of gameVersions) {
      if (props.getGameState(version)[3] === "CLOSED") {
        modalVersions.push(version);
      }
    }
  }
  return (
    <>
      {
        gameInfo && gameInfo.auditInfo ? (
          <ul>
            {
              myAuth === "READONLY" ? (
                <>
                  <li onClick={() => { props.getModifyGameInfo(gameInfo) }}>详情页</li>
                </>
              ) : (
                  <>
                    {
                      actionState && (actionState === '游戏下架' || gameInfo.auditInfo.auditUndoPublishFromVersion === "") ?
                        <li onClick={() => { props.getAuditModal('Warning', actionState, gameInfo) }}>{actionState}</li> : null
                    }
                    {
                      modalVersions.length > 0 ?
                        // style={modalVersions.length > 0 ? {} : { color: '#a7a7a7' }}
                        (<li
                          onClick={() => {
                            // if (modalVersions.length > 0) 
                            props.getAuditVersionModal('Version', '版本恢复', modalVersions)
                          }}
                        >
                          版本恢复</li>) : null
                    }
                    <li onClick={() => { props.getModifyGameInfo(gameInfo) }}>详情页</li>
                    <li onClick={() => {
                      if (gameInfo.publicStatus === 'PUBLISHED') {
                        props.getAuditModal('Warning', '下架并删除游戏', gameInfo);
                      } else {
                        props.getAuditModal('Warning', '删除游戏', gameInfo)
                      }
                    }}>删除游戏</li>
                  </>
                )
            }
          </ul>
        ) : null
      }
    </>
  )
}

class LetsPlayGame extends Component {
  static contextType = PlatformContext;
  constructor(props) {
    super(props);
    this.state = {
      arrowUp: true,
      loadPage: false,
      active: {
        versionState: false,
        detailsState: false,
        index: 0
      },
      auditModal: {
        isShowModal: false,
        text: '',
        versions: null
      },
      gameID: '',
      version: '',
      gameHeadInfo: null,
      ChangeStarts: ["IN_AUDIT", "UNDISCLOSED", "PUBLISHED", "CLOSED", "REJECTED"],
      sortType: 'UPDATETIME'
    }
  }

  async componentDidMount () {
    const that = this;
    this.setState({
      loadPage: true
    });
    if (window.qtJSON) {
      let json = {
        type: 'on',
        name: 'setConfig',
        cb: (server, token) => {
          console.log('server=====', server, token);
          //list是否为空
          if (window.qtJSON) {
            let json = {
              type: 'emit',
              name: 'setProjectVisible',
              cb: function () {
                if (token && projectVisible) return 'true'
                else return "false"
              }
            }
            window.qtJSON(json);
          }
        }
      }
      window.qtJSON(json);
    }


    // 刷新
    if (window.qtJSON) {
      let json = {
        type: 'on',
        name: 'refreshProfile',
        cb: function () {
          if (window.qtJSON) {
            let json = {
              type: 'emit',
              name: 'setProjectVisible',
              cb: function () {
                return projectVisible
              }
            }
            window.qtJSON(json);
          }
        }
      }
      window.qtJSON(json);
    }
  }

  getUpdateTime = (obl) => {
    this.hideModalAndAction();
    if (obl === 'update')
      this.setState({ arrowUp: true, sortType: 'UPDATETIME' })
    if (obl === 'creat')
      this.setState({ arrowUp: false, sortType: 'CREATIONTIME' })
  }

  onChangeStarts = (checkedValues) => {
    // console.log('checked = ', checkedValues);
    this.setState({
      ChangeStarts: checkedValues
    })
  }

  // 版本与详情按钮style
  getDropDown = (index, type) => {
    const { active } = this.state
    if (type === "version") {
      if (index === active.index) {
        this.setState({
          active: {
            detailsState: false,
            versionState: !active.versionState,
            index
          }
        })
      } else {
        this.setState({
          active: {
            detailsState: false,
            versionState: true,
            index
          }
        })
      }
    }
    if (type === 'details') {
      if (index === active.index) {
        this.setState({
          active: {
            detailsState: !active.detailsState,
            versionState: false,
            index
          }
        })
      } else {
        this.setState({
          active: {
            detailsState: true,
            versionState: false,
            index
          }
        })
      }
    }
  }

  getGameState = (gameInfo) => {
    let auditInfo = gameInfo.auditInfo;
    let publicStatus = gameInfo.publicStatus;
    if (!auditInfo && !publicStatus) {
      return ['', '', '', '', '']
    }
    // console.log(auditInfo.auditStatus, auditInfo.auditResult, publicStatus);
    if (['UN_AUDIT', ''].indexOf(auditInfo.auditStatus) > -1)
      return ['未提交审核', 'rgb(144, 154, 169)', 'auditing.png', 'UN_AUDIT']
    else if (['TO_AUDIT', 'IN_AUDIT'].indexOf(auditInfo.auditStatus) > -1)
      return ['审核中', 'rgb(96, 142, 210)', 'auditing.png', 'IN_AUDIT', '撤回审核']
    else if (auditInfo.auditResult === 'REJECTED')
      return ['审核未通过', 'rgb(206, 114, 102)', 'audit_rejected.png', 'REJECTED']
    else if (auditInfo.auditResult === 'PASSED' && (publicStatus === 'UNDISCLOSED' || publicStatus === ''))
      return ['审核已通过-待发布', 'rgb(219, 186, 99)', 'audit_undisclosed.png', 'UNDISCLOSED', '提交上架']
    else if (publicStatus === 'PUBLISHED')
      return ['已上架', 'rgb(105, 185, 108)', 'audit_published.png', 'PUBLISHED', '游戏下架']
    else if (publicStatus === 'CLOSED')
      if (auditInfo.auditUndoPublishReason) return ['被举报已下架', 'rgb(206, 114, 102)', 'audit_closed.png', 'CLOSED']
      else return ['已下架', 'rgb(206, 114, 102)', 'audit_closed.png', 'CLOSED', '重新上架']
  }

  // 版本号审核队列
  getGameVersions = (versionInfo) => {
    if (!versionInfo) {
      return
    }
    let auditQueuePosArray = [];
    let itemIndex = 0;
    versionInfo.map((item, index) => {
      if (this.getGameState(item)[0] === "审核中") {
        auditQueuePosArray[itemIndex] = item.auditInfo.auditQueuePos
        itemIndex++;
      }
    })
    let minQueuePos = Math.min.apply(Math, auditQueuePosArray);
    return minQueuePos
  }
  getAuditVersionModal = (type, value, gameVersions) => {
    this.setState({
      auditModal: {
        isShowModal: true,
        text: value, type: type,
        versions: gameVersions
      }
    });
  }
  getAuditModal = (type, value, gameInfo) => {
    this.setState({
      auditModal: {
        isShowModal: true,
        text: value, type: type,
      }
    });
    if (gameInfo) {
      this.setState({
        gameID: gameInfo.id,
        version: gameInfo.version,
        gameHeadInfo: gameInfo
      });
    }
  }

  closeAuditModal = () => {
    this.setState({
      auditModal: { isShowModal: false }
    });
  }

  auditGameUndoBegin = () => {
    //撤销审核
    const { gameID, version } = this.state;
    const { client } = this.props;

    client.mutate({
      mutation: AUDIT_GAME_UNDOBEGIN,
      variables: {
        gameID,
        version
      },
    }).then((dt) => {
      console.log('撤销成功', dt)
    }).catch((error) => {
      this.getAuditModal("Error", "撤销失败")
    })
  }

  deleteGameModal = () => {
    // 删除
    const { gameID, version } = this.state;
    const { client } = this.props;

    client.mutate({
      mutation: DELETE_GAME,
      variables: {
        gameID,
        version
      },
    }).then((dt) => {
      console.log('删除成功', dt);
      this._refreshPage();
      this.hideModalAndAction()
    }).catch((error) => {
      console.log('删除失败', error);
      this.getAuditModal("Error", "游戏删除失败")
    })
  }

  publishGameModal = () => {
    // 上架处理
    const { gameID, version } = this.state;
    const { client } = this.props;
    client.mutate({
      mutation: PUBLISH_GAME,
      variables: {
        input: {
          gameID,
          version
        }
      },
    }).then((dt) => {
      console.log('上架处理', dt)
    }).catch((error) => {
      console.log(error)
      this.getAuditModal("Error", "游戏上架失败")
    })
  }



  // 详情页
  getModifyGameInfo = (gameInfo) => {
    if (window.qtJSON) {
      let json = {
        type: 'emit',
        name: 'modifyGameInfo',
        cb: function () {
          return JSON.stringify({
            gameID: gameInfo.id,
            gameVersion: gameInfo.version
          });
        }
      }
      window.qtJSON(json);
    }
    this.setState({
      active: { versionState: false, detailsState: false }
    });
  }
  // 下架
  getAuditPublishedModal = () => {
    const { gameID, version } = this.state;
    const { client } = this.props;
    client.mutate({
      mutation: PUBLISH_UNDOGAME_GAME,
      variables: {
        input: {
          gameID,
          version
        }
      },
    }).then((dt) => {
      console.log('下架成功', dt)
      this.deleteGameModal()
    }).catch((error) => {
      console.log(error)
      this.getAuditModal("Error", "游戏下架失败")
    })
  }

  // 请求完成后弹框处理
  hideModalAndAction = () => {
    this.setState({
      auditModal: { isShowModal: false },
      active: { versionState: false, detailsState: false }
    });
  }

  _refreshPage = () => {
    // const { loadPage } = this.state;
    this.setState({
      loadPage: false,
      active: { versionState: false, detailsState: false }
    }, () => {
      this.setState({
        loadPage: true
      });
    });
  }

  showWildCard = (gameItem, image) => {
    return (
      gameItem.auditInfo &&
        (this.getGameState(gameItem)[0] === "被举报已下架")
        || (gameItem.auditInfo.auditReason && this.getGameState(gameItem)[0] === "审核未通过") ? (
          <img src={image} alt="" onClick={() => { this.getAuditModal('Notify', '举报', gameItem) }} />
        ) : null
    )
  }


  render () {
    const webpackContext = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const webpackContextIcons = require.context('assets/img/icons', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    const imagesIcon = importAll(webpackContextIcons);
    const { arrowUp, active, auditModal, gameID, version, ChangeStarts, sortType, gameHeadInfo, loadPage
    } = this.state;
    const { client, intl } = this.props;
    return (
      <div className="letsplay-game">
        <GameTitle onChangeStarts={this.onChangeStarts} imgs={imagesIcon['audit_updatetime.png']}
          arrowUp={arrowUp} getUpdateTime={this.getUpdateTime} />
        <Fragment>
          {
            loadPage ?
              (
                <>
                  <Query query={DEVELOPER_GAMESDISPLAY_INFO}
                    fetchPolicy={'no-cache'}
                    variables={{
                      sortType
                    }}
                  >
                    {
                      ({ loading, error, data, refetch }) => {
                        if (loading) {
                          return (<div className='content-center'>{intl.messages['game.loading'] || 'Loading...'}</div>)
                        }
                        if (error) {
                          return (<div className='content-center'>Error!</div>)
                        }
                        if (data && data.developerGamesDisplayInfo.games) {
                          if (data.developerGamesDisplayInfo.games.length > 0) projectVisible = true
                          else projectVisible = false
                          return (
                            <Fragment>
                              {
                                data.developerGamesDisplayInfo.games.length ? (
                                  data.developerGamesDisplayInfo.games.map((item, index) => {
                                    const minQueuePos = this.getGameVersions(item.versions);
                                    let subHeadGameFlag = ChangeStarts.indexOf(this.getGameState(item.headGame)[3]) > -1
                                    let subVersionFlag = false;
                                    let modalVersions = [];
                                    if (item.versions && item.versions.length) {
                                      for (let itemVersion of item.versions) {
                                        if (ChangeStarts.indexOf(this.getGameState(itemVersion)[3]) > -1
                                          && this.getGameState(itemVersion)[3] != "CLOSED") {
                                          subVersionFlag = true;
                                        }
                                        // 是否显示版本按钮
                                        if (["未提交审核", "被举报已下架", "已下架"].indexOf(this.getGameState(itemVersion)[0]) === -1) {
                                          modalVersions.push(itemVersion);
                                        }
                                      }
                                    }
                                    return (
                                      <Fragment key={item.headGame.id}>
                                        {
                                          // (ChangeStarts.length === 0 && this.getGameState(item.headGame)[0] != "未提交审核") ||
                                          subHeadGameFlag || subVersionFlag ? (
                                            <div className="letsplay-game-list">
                                              <div className="letsplay-game-list-details">
                                                <img src={item.headGame.iconURL} alt='icon' />
                                                <div className="letsplay-game-list-content">
                                                  <p className="game-title">{item.headGame.name}</p>
                                                  <p className="game-time">last update:{dateFormat('yyyy/MM/dd hh:mm', new Date(item.headGame.lastChangeTime))}</p>
                                                  {/* 状态：背景颜色和图片不同 */}
                                                  <div>
                                                    <button
                                                      className="game-state"
                                                      style={{ backgroundColor: this.getGameState(item.headGame)[1] }}
                                                    >
                                                      <img src={imagesIcon[this.getGameState(item.headGame)[2]]} alt='icon' />
                                                      {
                                                        <span>{this.getGameState(item.headGame)[0]}</span>
                                                      }
                                                    </button>
                                                    {
                                                      this.showWildCard(item.headGame, images['icon_question.png'])
                                                    }
                                                  </div>
                                                </div>
                                                <div className="game-details">
                                                  <p className="game-title-version"
                                                    style={{ marginRight: `${modalVersions.length > 0 ? '1.6rem' : '0.2rem'}` }}>
                                                    V{item.headGame.version}</p>
                                                  <div className="dropDown-game-fill">
                                                    <button
                                                      className={`details-btn ${active.detailsState && active.index === index ? 'dropDown-click-details' : 'dropUp-click-details'}`}
                                                      onClick={() => { this.getDropDown(index, 'details') }}
                                                    >
                                                      <img src={images['Icon_more.png']} alt='icon' />
                                                    </button>
                                                    <GameStateUl
                                                      myAuth={item.myAuth}
                                                      gameInfo={item.headGame}
                                                      gameVersions={item.versions}
                                                      getModifyGameInfo={this.getModifyGameInfo}
                                                      getAuditVersionModal={this.getAuditVersionModal}
                                                      getAuditModal={this.getAuditModal}
                                                      getAuditPublishedModal={this.getAuditPublishedModal}
                                                      getGameState={this.getGameState} />
                                                  </div>
                                                </div>
                                              </div>
                                              {/* 状态：版本 */}
                                              {
                                                item.versions && item.versions.length && modalVersions.length > 0 ? (
                                                  <div className="game-details game-version-btn">
                                                    <div className="dropDown-game-fill">
                                                      <button
                                                        className={`version-btn ${active.versionState && active.index === index ? 'dropDown-click-version' : 'dropUp-click-version'} `}
                                                        onClick={() => { this.getDropDown(index, 'version') }} >版本
                                         <img src={active.versionState && active.index === index ? images['arrow_down.svg'] : images['arrow_up.svg']} />
                                                      </button>
                                                      <ul>
                                                        {
                                                          item.versions.map((versionsItem, index) => {
                                                            return (
                                                              <Fragment key={versionsItem.version}>
                                                                {
                                                                  ["未提交审核", "被举报已下架", "已下架"].indexOf(this.getGameState(versionsItem)[0]) === -1 ? (
                                                                    <li>
                                                                      <div>
                                                                        <p className="game-title">{versionsItem.name}</p>
                                                                        <p className="game-title game-title-version">V{versionsItem.version}</p>
                                                                        <button
                                                                          className="game-state"
                                                                          style={{ backgroundColor: this.getGameState(versionsItem)[1] }}
                                                                        >
                                                                          <img src={imagesIcon[this.getGameState(versionsItem)[2]]} alt='icon' />
                                                                          {
                                                                            this.getGameState(versionsItem)[0] === "审核中" ? (
                                                                              versionsItem.auditInfo.auditQueuePos === minQueuePos ?
                                                                                <span>审核中</span> : <span>审核队列中</span>
                                                                            ) : <span>{this.getGameState(versionsItem)[0]}</span>
                                                                          }
                                                                        </button>
                                                                        {
                                                                          this.showWildCard(versionsItem, images['icon_question.png'])
                                                                        }
                                                                      </div>
                                                                      <div>
                                                                        <p className="game-time">{dateFormat('MM/dd hh:mm', new Date(versionsItem.lastChangeTime))}</p>
                                                                        <div className="dropDown-game-fill fill-versopm-details">
                                                                          <button className='details-btn' >
                                                                            <img src={images['Icon_more.png']} alt='icon' />
                                                                          </button>
                                                                          <GameStateUl
                                                                            myAuth={item.myAuth}
                                                                            gameInfo={versionsItem}
                                                                            getModifyGameInfo={this.getModifyGameInfo}
                                                                            getAuditVersionModal={this.getAuditVersionModal}
                                                                            getAuditModal={this.getAuditModal}
                                                                            getAuditPublishedModal={this.getAuditPublishedModal}
                                                                            getGameState={this.getGameState} />
                                                                        </div>
                                                                      </div>
                                                                    </li>
                                                                  ) : null
                                                                }
                                                              </Fragment>
                                                            )
                                                          })
                                                        }
                                                      </ul>
                                                    </div>
                                                  </div>
                                                ) : null
                                              }

                                            </div>
                                          ) : null
                                        }
                                      </Fragment>
                                    )
                                  })
                                ) : (<div className='content-center'>No Data</div>)
                              }
                              {
                                auditModal.isShowModal ? (
                                  <AuditModal type={auditModal.type}
                                    stateValue={auditModal.text}
                                    onClose={this.closeAuditModal}
                                    versionItem={auditModal.versions}
                                    gameHeadInfo={gameHeadInfo}
                                    contextApi={this.context.api}
                                    closeAllModal={(value) => {
                                      this.setState({ auditModal: { isShowModal: value } });
                                      this._refreshPage()
                                      this.hideModalAndAction();
                                    }}
                                    onOk={['删除游戏', '下架并删除游戏', '撤回审核'].indexOf(auditModal.text) > -1 ? () => {
                                      if (auditModal.text === '下架并删除游戏') {
                                        this.getAuditPublishedModal();
                                      } else {
                                        client.mutate({
                                          mutation: DELETE_GAME,
                                          variables: {
                                            gameID,
                                            version
                                          },
                                        }).then((dt) => {
                                          console.log('删除成功', dt);
                                          // refetch();
                                          this._refreshPage();
                                          this.hideModalAndAction();
                                        }).catch((error) => {
                                          this.getAuditModal("Error", "游戏删除失败")
                                        })
                                      }
                                    } : auditModal.text === '游戏下架' ? () => {
                                      client.mutate({
                                        mutation: PUBLISH_UNDOGAME_GAME,
                                        variables: {
                                          input: {
                                            gameID,
                                            version
                                          }
                                        },
                                      }).then((dt) => {
                                        console.log('游戏下架成功', dt)
                                        refetch();
                                        this.hideModalAndAction();
                                      }).catch((error) => { console.log(error); this.getAuditModal("Error", "游戏下架失败") })
                                    } : () => {
                                      client.mutate({
                                        mutation: PUBLISH_GAME,
                                        variables: {
                                          input: {
                                            gameID,
                                            version
                                          }
                                        },
                                      }).then((dt) => {
                                        console.log('上架处理成功', dt)
                                        refetch();
                                        this.hideModalAndAction();
                                      }).catch((error) => { this.getAuditModal("Error", "游戏上架失败") })
                                    }
                                    }
                                  />
                                ) : null
                              }
                            </Fragment>
                          )
                        } else {
                          return (
                            <div className='content-center'>No Data</div>
                          )
                        }

                      }
                    }
                  </Query>
                </>
              ) :
              (
                <>
                  Loading page...
                </>
              )
          }

        </Fragment>
      </div>
    );
  }
}


const LetsPlayWithRouter = withRouter(withApollo(injectIntl(LetsPlayGame)));
delete LetsPlayWithRouter.contextType;
export default LetsPlayWithRouter;