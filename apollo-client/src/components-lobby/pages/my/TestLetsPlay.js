import React, { Component, Fragment } from 'react';
import { Checkbox, Row, Col } from 'antd';
import { withRouter } from 'react-router-guard';
import { Query, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { importAll, dateFormat } from "utils";
import { PlatformContext } from "states/context/PlatformContext";
import TestAuditModal from 'components-lobby/partial/modal/TestAuditModal'
import { GraphQLEnumType } from 'graphql';

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

const DEVELOPER_GAMESDISPLAY_INFO = gql`
query developerGamesDisplayInfo($sortType:DevGamesSortType!){
  developerGamesDisplayInfo(sortType:$sortType){
    games{
      headGame{
        id
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
        }
        publicStatus
        lastChangeTime
      }
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
      <Checkbox.Group className="checkbox-group" onChange={props.onChangeStarts}>
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
        <span>Update Time</span>
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
  const { gameInfo, gameVersions } = props
  const actionState = props.getGameState(gameInfo)[4];
  let gameVersionPassed = 0;
  if (gameVersions && gameVersions.length) {
    for (let item of gameVersions) {
      if (item.auditInfo.auditResult === 'PASSED')
        gameVersionPassed++;
    }
  }
  console.log(gameVersionPassed);
  return (
    <>
      {
        gameInfo && gameInfo.auditInfo ? (
          <ul>
            {
              actionState ?
                <li onClick={() => { props.getAuditModal('Warning', actionState, gameInfo) }}>{actionState}</li> : null
            }
            {
              gameVersionPassed > 0 ? (
                <li onClick={() => { props.getAuditVersionModal('Version', '版本恢复', gameVersions) }}>版本恢复</li>) : null
            }
            <li onClick={() => { props.getModifyGameInfo(gameInfo) }}>详情页</li>
            <li onClick={() => {
              if (gameInfo.publicStatus === 'PUBLISHED') props.getAuditPublishedModal(gameInfo);
              props.getAuditModal('Warning', '下架并删除游戏', gameInfo);
            }}>删除游戏</li>
          </ul>
        ) : null
      }
    </>
  )
}

class TestLetsPlay extends Component {
  static contextType = PlatformContext;
  constructor(props) {
    super(props);
    this.state = {
      arrowUp: true,
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
      ChangeStarts: [],
      sortType: 'UPDATETIME'
    }
  }

  async componentDidMount () {
    const that = this;
    if (window.qtJSON) {
      let json = {
        type: 'on',
        name: 'setConfig',
        cb: (server, token) => {
          console.log('server', server);
          // if (window.qtJSON) {
          //   let json = {
          //     type: 'emit',
          //     name: 'setProjectVisible',
          //     cb: function () {
          //     }
          //   }
          //   window.qtJSON(json);
          // }
        }
      }
      window.qtJSON(json);
    }

  }

  getUpdateTime = (obl) => {
    if (obl === 'update')
      this.setState({ arrowUp: true, sortType: 'UPDATETIME' })
    if (obl === 'creat')
      this.setState({ arrowUp: false, sortType: 'CREATIONTIME' })
    console.log(obl);
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
      return []
    }
    // console.log(auditInfo.auditStatus, auditInfo.auditResult, publicStatus);
    if (auditInfo.auditStatus === 'UN_AUDIT' || auditInfo.auditStatus === '')
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
      return ['已下架', 'rgb(206, 114, 102)', 'audit_closed.png', 'CLOSED', '重新上架']
    // 被举报下架
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
      },
      gameID: gameInfo.id,
      version: gameInfo.version,
      gameHeadInfo: gameInfo
    });

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

    })
  }

  deleteGameModal = () => {
    // 删除
    const { gameID, version, changeGameList } = this.state;
    const { client } = this.props;

    client.mutate({
      mutation: DELETE_GAME,
      variables: {
        gameID,
        version
      },
    }).then((dt) => {
      console.log('删除成功', dt);
      this.setState({
        auditModal: { isShowModal: false },
        changeGameList: !changeGameList,
        active: {
          versionState: false,
          detailsState: false
        }
      });

    }).catch((error) => {

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
  getAuditPublishedModal = (gameInfo) => {
    const { client } = this.props;
    client.mutate({
      mutation: PUBLISH_UNDOGAME_GAME,
      variables: {
        input: {
          gameID: gameInfo.id,
          version: gameInfo.version
        }
      },
    }).then((dt) => {
      console.log('下架成功', dt)
    }).catch((error) => {
      console.log(error)
    })
  }

  // 请求完成后弹框处理
  hideModalAndAction = () => {
    this.setState({
      auditModal: { isShowModal: false },
      active: { versionState: false, detailsState: false }
    });
  }

  render () {
    const webpackContext = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const webpackContextIcons = require.context('assets/img/icons', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    const imagesIcon = importAll(webpackContextIcons);
    const { arrowUp, active, auditModal, gameID, version, ChangeStarts, sortType, gameHeadInfo } = this.state;
    const { client } = this.props;
    return (
      <div className="letsplay-game">
        <GameTitle onChangeStarts={this.onChangeStarts} imgs={imagesIcon['audit_updatetime.png']}
          arrowUp={arrowUp} getUpdateTime={this.getUpdateTime} />
        <Fragment>
          <Query query={DEVELOPER_GAMESDISPLAY_INFO}
            fetchPolicy={'no-cache'}
            variables={{
              sortType
            }}
          >
            {
              ({ loading, error, data, refetch }) => {
                // console.log(data);
                if (loading) {
                  return (<div className='content-center'>Loading...</div>)
                }
                if (error) {
                  console.log(error);
                  return (<div className='content-center'>Error!</div>)
                }
                if (data && data.developerGamesDisplayInfo.games) {
                  return (
                    <Fragment>
                      {
                        data.developerGamesDisplayInfo.games.length ? (
                          data.developerGamesDisplayInfo.games.map((item, index) => {
                            const minQueuePos = this.getGameVersions(item.versions);
                            let subHeadGameFlag = ChangeStarts.indexOf(this.getGameState(item.headGame)[3]) > -1
                            let subVersionFlag = false;
                            if (item.versions && item.versions.length) {
                              for (let itemVersion of item.versions) {
                                if (ChangeStarts.indexOf(this.getGameState(itemVersion)[3]) > -1) {
                                  subVersionFlag = true;
                                }
                              }
                            }

                            return (
                              <>
                                {
                                  ChangeStarts.length === 0 || subHeadGameFlag || subVersionFlag
                                    ? (
                                      <div className="letsplay-game-list" key={item.id + index}>
                                        <div className="letsplay-game-list-details">
                                          <img src={item.headGame.iconURL} alt='icon' />
                                          <div className="letsplay-game-list-content">
                                            <p className="game-title">{item.headGame.name}</p>
                                            <p className="game-time">last update:{dateFormat('yyyy/MM/dd', new Date(item.headGame.lastChangeTime))}</p>
                                            {/* 状态：背景颜色和图片不同 */}
                                            <div>
                                              <button
                                                className="game-state"
                                                style={{ backgroundColor: this.getGameState(item.headGame)[1] }}
                                              >
                                                <img src={imagesIcon[this.getGameState(item.headGame)[2]]} alt='icon' />
                                                {
                                                  item.headGame.publicStatus === "CLOSED" ? (
                                                    (
                                                      item.headGame.auditInfo && item.headGame.auditInfo.auditUndoPublishReason ?
                                                        <span>被举报已下架</span> : <span>已下架</span>
                                                    )
                                                  ) : <span>{this.getGameState(item.headGame)[0]}</span>
                                                }
                                              </button>
                                              {
                                                item.headGame.auditInfo &&
                                                  item.headGame.auditInfo.auditUndoPublishReason &&
                                                  (item.headGame.auditInfo.auditResult === 'REJECTED' || item.headGame.publicStatus === "CLOSED") ? (
                                                    <img src={images['icon_question.png']} alt=""
                                                      onClick={() => { this.getAuditModal('Notify', '被举报', item.headGame) }} />
                                                  ) : null
                                              }
                                            </div>
                                          </div>
                                          <div className="game-details">
                                            <div className="dropDown-game-fill">
                                              <button
                                                className={`details-btn ${active.detailsState && active.index === index ? 'dropDown-click-details' : 'dropUp-click-details'}`}
                                                onClick={() => { this.getDropDown(index, 'details') }}
                                              >
                                                <img src={images['Icon_sl.svg']} alt='icon' />
                                              </button>
                                              <GameStateUl
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
                                          item.versions && item.versions.length ? (
                                            <div className="game-details game-version-btn">
                                              <div className="dropDown-game-fill">
                                                <button
                                                  className={`version-btn ${active.versionState && active.index === index ? 'dropDown-click-version' : 'dropUp-click-version'} `}
                                                  onClick={() => { this.getDropDown(index, 'version') }}     >版本
                                         <img src={active.versionState && active.index === index ? images['arrow_down.svg'] : images['arrow_up.svg']} />
                                                </button>
                                                <ul>
                                                  {
                                                    item.versions.map((item, index) => {
                                                      return (
                                                        <>
                                                          <li key={item.version + index}>
                                                            <div>
                                                              <p className="game-title">{item.name}</p>
                                                              <button
                                                                className="game-state"
                                                                style={{ backgroundColor: this.getGameState(item)[1] }}
                                                              >
                                                                <img src={imagesIcon[this.getGameState(item)[2]]} alt='icon' />
                                                                {
                                                                  this.getGameState(item)[0] === "审核中" ? (
                                                                    item.auditInfo.auditQueuePos === minQueuePos ?
                                                                      <span>审核中</span> : <span>审核队列中</span>
                                                                  ) : <span>{this.getGameState(item)[0]}</span>
                                                                }
                                                              </button>
                                                            </div>
                                                            <div>
                                                              <p className="game-time">{dateFormat('MM/dd hh:mm', new Date(item.lastChangeTime))}</p>
                                                              <div className="dropDown-game-fill fill-versopm-details">
                                                                <button className='details-btn' >
                                                                  <img src={images['Icon_sl.svg']} alt='icon' />
                                                                </button>
                                                                <GameStateUl
                                                                  gameInfo={item}
                                                                  getModifyGameInfo={this.getModifyGameInfo}
                                                                  getAuditVersionModal={this.getAuditVersionModal}
                                                                  getAuditModal={this.getAuditModal}
                                                                  getAuditPublishedModal={this.getAuditPublishedModal}
                                                                  getGameState={this.getGameState} />
                                                              </div>
                                                            </div>
                                                          </li>
                                                        </>
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
                              </>
                            )
                          })
                        ) : (<div className='content-center'>No Data</div>)
                      }
                      {
                        auditModal.isShowModal ? (
                          <TestAuditModal type={auditModal.type}
                            stateValue={auditModal.text}
                            onClose={this.closeAuditModal}
                            versionItem={auditModal.versions}
                            gameHeadInfo={gameHeadInfo}
                            contextApi={this.context.api}
                            onOk={['删除游戏', '下架并删除游戏'].indexOf(auditModal.text) > -1 ? () => {
                              client.mutate({
                                mutation: DELETE_GAME,
                                variables: {
                                  gameID,
                                  version
                                },
                              }).then((dt) => {
                                console.log('删除成功', dt);
                                refetch();
                                this.hideModalAndAction();
                              }).catch((error) => {
                                this.hideModalAndAction();
                                // alert('删除失败');
                              })
                            } : auditModal.text === '撤回审核' ? () => {
                              client.mutate({
                                mutation: AUDIT_GAME_UNDOBEGIN,
                                variables: {
                                  gameID,
                                  version
                                },
                              }).then((dt) => {
                                console.log('撤销成功', dt)
                                refetch();
                                this.hideModalAndAction();
                              }).catch((error) => { })
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
                              }).catch((error) => { })
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
                              }).catch((error) => { })
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

        </Fragment>
      </div>
    );
  }
}


const TestLetsPlayWithRouter = withRouter(withApollo(TestLetsPlay));
delete TestLetsPlayWithRouter.contextType;
export default TestLetsPlayWithRouter;
