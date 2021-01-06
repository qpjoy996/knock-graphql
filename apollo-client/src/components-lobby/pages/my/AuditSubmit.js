import React, { Component, Fragment } from 'react';
import { Checkbox, Row, Col, Radio } from 'antd';
import { withRouter } from 'react-router-guard';
import { withApollo, Query } from 'react-apollo';
import { importAll, uniqueArray, charCodeLen } from "utils";
import gql from 'graphql-tag';
import { PlatformContext } from "states/context/PlatformContext";
import { GraphQLEnumType } from 'graphql';
import AuditModal from 'components-lobby/partial/modal/AuditModal'


const GamePublishActionOnAudit = new GraphQLEnumType({
  name: "GamePublishActionOnAudit",
  values: {
    AUTO_PUBLISH: {
      value: 0
    },
    MANUAL_PUBLISH: {
      value: 1
    }
  }
})


const AUDIT_GAME_BEGIN = gql`
mutation auditGameBegin($input: BeginGameAuditInput!){
    auditGameBegin(input: $input){
      code
    }
  }
`;

const UPDATE_GAME_VISIBILITY = gql`
mutation updateGameVisibility($input: UpdateGameVisibilityInput!){
  updateGameVisibility(input: $input){
      code
    }
  }
`;

const GROUPDISPLAY_INFOLIST = gql`
  query groupDisplayInfoList($input: GroupDataViewInput!){
    groupDisplayInfoList(input: $input){
      groups{
         groupID
         shortID
         ownerID
         name
       members{
         userID
         displayUserInfo{
           userID
           nickname
           gender
           iconURL
         }
       }
       belongActivityID
       belongActivityName
       developedGames{
         gameID
       }
     }
    }
  }
`;

const PublishActionOption = [
  { label: '审核通过后自动上架', value: 'AUTO_PUBLISH' },
  { label: '审核通过后手动上架', value: 'MANUAL_PUBLISH' }
]
//组队信息
let membersGroupArray = [];
//队伍显示的头像个数
const foxHoundCount = 4;

class AuditSubmit extends Component {
  static contextType = PlatformContext;
  constructor(props) {
    super(props);
    this.state = {
      result: false,
      gameID: '',
      // version: '0.0.1',
      publishAction: 'AUTO_PUBLISH',
      publishToDevActivityID: '',
      publishToGroupID: '',
      isShowModal: false,
      modalText: '提交失败',
      isUpdate: false,
      isWorkshop: false
    }
  }

  async componentDidMount () {
    //发布至内容字符<30  
    let auditIssue = this.auditContentRef && this.auditContentRef.childNodes[0];
    setTimeout(function () {
      let auditGroup = auditIssue && auditIssue.childNodes[1].childNodes;
      for (let i = 0; i < auditGroup.length; i++) {
        let auditSpan = auditGroup[i].childNodes[1];
        if (charCodeLen(auditSpan.textContent) > 29) {
          auditSpan.style.width = "30ch"
          auditSpan.style.display = "inline-block"
          auditSpan.style.whiteSpace = "normal"
        }
        auditSpan.style.verticalAlign = "middle"
      }
    }, 100)

    const { client } = this.props;
    let that = this;
    // 监听是否修改
    let isUpdateJson = {
      type: 'on',
      name: 'setGameConfig',
      cb: function (isUp) {
        that.setState({
          isUpdate: isUp === "true" ? true : false
        })
      }
    }
    window.qtJSON(isUpdateJson);

    let json = {
      type: 'on',
      name: 'gameUploaded',
      cb: function (result, gameID, version) {
        // console.log("result,gameID========", result, gameID, version)
        that.setState({
          gameID,
          result,
          version
        })
        if (that.state.isWorkshop) {
          that._workShopSApi();
        } else if (!that.isWorkshop) {
          that._auditApi();
        }

      }
    }
    window.qtJSON(json);

  }

  //活动发布
  onChangePublishTo = e => {
    // console.log('checked = ', e.target.value);
    this.setState({
      publishToDevActivityID: e.target.value,
      publishToGroupID: '',
    });
  }

  // 上架管理
  onChangePublishAction = e => {
    // console.log('radio checked', e.target.value);
    this.setState({
      publishAction: e.target.value
    });
  };
  //队伍 
  onChangeGroupID = e => {
    // console.log('radio checked', e.target.value);
    this.setState({
      publishToGroupID: e.target.value,
    });
  };

  _auditApi = async () => {
    const { gameID, version, publishAction, publishToGroupID, publishToDevActivityID } = this.state;
    const { client } = this.props
    client.mutate({
      mutation: AUDIT_GAME_BEGIN,
      variables: {
        input: {
          gameID,
          version,
          publishAction,
          publishToDevActivityID,
          publishToGroupID
        }
      },
    }).then((dt) => {
      this.closeDialog('{ "result": "0", "message": "Audit submit success" }')
      console.log('提交成功=====', dt)
    }).catch((error) => {
      //loading
      // console.log('error=========111111', error);
      let message = error.graphQLErrors[0] && error.graphQLErrors[0].message;
      this.closeDialog('{ "result": "1", "message": "' + message + '"}')
    })
  }
  auditSubmit = async () => {
    this.setState({ isWorkshop: false }, () => {
      const { publishToGroupID, publishToDevActivityID } = this.state;
      if (publishToDevActivityID != '' && publishToGroupID === '') {
        this.setState({ isShowModal: true, modalText: '队伍不能为空！' })
      } else {
        if (window.qtJSON) {
          let json = {
            type: 'emit',
            name: 'startUploadGame',
            cb: function () { }
          }
          window.qtJSON(json);
        }
      }
    })
  }

  _workShopSApi = async () => {
    const { gameID, version, publishToGroupID, publishToDevActivityID } = this.state;
    const { client } = this.props
    client.mutate({
      mutation: UPDATE_GAME_VISIBILITY,
      variables: {
        input: {
          gameID,
          version,
          devActivityID: publishToDevActivityID,
          groupID: publishToGroupID
        }
      },
    }).then((dt) => {
      this.closeDialog('{ "result": "0", "message": "上传成功" }')
      console.log('上传成功=====', dt)
    }).catch((error) => {
      let message = error.graphQLErrors[0] && error.graphQLErrors[0].message;
      this.closeDialog('{ "result": "1", "message": "' + message + '"}')
    })

  }

  workShopSubmit = async () => {
    this.setState({ isWorkshop: true }, () => {
      if (window.qtJSON) {
        let json = {
          type: 'emit',
          name: 'startUploadGame',
          cb: function () { }
        }
        window.qtJSON(json);
      }
    })

  }

  closeModal = () => {
    this.setState({ isShowModal: false })
  }

  closeDialog = (str) => {
    // console.log('str' + str);
    if (window.qtJSON) {
      let json = {
        type: 'emit',
        name: 'closeDialog',
        cb: function () {
          return str
        }
      }
      window.qtJSON(json);
    }
  }

  //发布至
  getBelongActivityArray = (groups) => {
    let activityArray = [{ label: '不限', value: '' }];
    groups.map((item, id) => {
      if (item.belongActivityName != "") {
        activityArray.push(
          {
            label: item.belongActivityName,
            value: item.belongActivityID
          }
        )
      }
    })
    return uniqueArray(activityArray);
  }


  //队伍
  getMembersArray = (groups, belongArray) => {
    let membersArray = [];
    belongArray.map((belong, id) => {
      for (let item of groups) {
        if (item.belongActivityID === belong.value) {
          membersArray.push({
            belongID: belong.value,
            groupID: item.groupID,
            members: item.members,
            name: item.name,
            developedGames: item.developedGames
          })
        }
      }
    })
    return membersArray
  }

  render () {
    const webpackContext = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    const { publishAction, publishToDevActivityID, publishToGroupID, isUpdate,
      isShowModal, modalText } = this.state;
    return (
      <div className="audit-submit">
        {/* <div className="audit-title">提交审核<span>✕</span></div> */}
        <div className="audit-content-all">
          <div className="audit-content" ref={el => this.auditContentRef = el}>
            {
              !isUpdate ? (
                <Query query={GROUPDISPLAY_INFOLIST}
                  fetchPolicy={'no-cache'}
                  variables={{
                    input: {
                      iAmOwner: true
                    }
                  }}
                >
                  {
                    ({ loading, error, data, client, refetch }) => {
                      if (loading) {
                        return (<div>Loading...</div>)
                      }
                      if (error) {
                        console.log(error);
                        return (
                          <div style={{ fontSize: '0.35rem', margin: "18px", color: "#ccc" }}>
                            <span>发布至队伍信息遇到网络异常,请重试!</span>
                            <span style={{ color: "#2f81c7", marginLeft: "10px" }} onClick={() => refetch()}>刷新</span>
                          </div>
                        )
                      }
                      // console.log(data.groupDisplayInfoList.groups);
                      if (data && data.groupDisplayInfoList.groups) {
                        let groups = data.groupDisplayInfoList.groups;
                        let belongActivityArray = this.getBelongActivityArray(groups);
                        let getMembersArray = this.getMembersArray(groups, belongActivityArray);
                        membersGroupArray = [];
                        getMembersArray.map((item, id) => {
                          if (publishToDevActivityID === item.belongID) {
                            membersGroupArray.push(item)
                          }
                        })
                        return (
                          <>
                            <div className="audit-content-issue" >
                              <p>发布至</p>
                              <Radio.Group options={belongActivityArray}
                                className="checkbox-group"
                                onChange={this.onChangePublishTo}
                                value={publishToDevActivityID} />
                            </div>
                            <div className="audit-content-troops">
                              <p>队伍</p>
                              <div className="troops-list">
                                {
                                  membersGroupArray.length > 0 ? (
                                    <Radio.Group className="checkbox-group"
                                      onChange={this.onChangeGroupID}
                                      value={publishToGroupID}>
                                      {
                                        membersGroupArray.map((item, index) => {
                                          let membersLen = item.members.length;
                                          return (
                                            <Radio value={item.groupID} key={item.groupID}
                                              disabled={item.developedGames && item.developedGames.length > 0 ? true : false}>
                                              <div>
                                                <p>{item.name}</p>
                                                <div>
                                                  {
                                                    item.members.map((item, index) => {
                                                      return (
                                                        <Fragment key={item.userID}>
                                                          {index === foxHoundCount ? (
                                                            <div className="img-more"  >
                                                              <span>+{membersLen - foxHoundCount}</span>
                                                            </div>
                                                          ) : ((index < foxHoundCount) ?
                                                            <img src={item.displayUserInfo.iconURL ?
                                                              item.displayUserInfo.iconURL : images['Icon_head.png']} alt='' />
                                                            : null)
                                                          }
                                                        </Fragment>
                                                      )
                                                    })
                                                  }
                                                </div>
                                              </div>
                                              {
                                                item.developedGames && item.developedGames.length > 0 ? (
                                                  <div className="group-disChoose">
                                                    <span>无法选择</span>
                                                    <span>该队伍已经上传一张地图</span>
                                                  </div>
                                                ) : null
                                              }
                                            </Radio>
                                          )
                                        })
                                      }
                                    </Radio.Group>
                                  ) : (
                                      <div style={{ fontSize: '12px', color: '#ccc' }}>活动状态公开</div>
                                    )
                                }
                              </div>
                            </div>
                          </>)
                      } else {
                        return (<div>无组队信息...</div>)
                      }
                    }
                  }
                </Query>
              ) : null
            }
            <div className="audit-content-putin">
              <p>上架管理</p>
              <Radio.Group options={PublishActionOption}
                className="checkbox-group"
                onChange={this.onChangePublishAction}
                value={publishAction} />
            </div>
          </div>
          <div className="audit-content-btn">
            {
              !isUpdate ? <button className="btn-ok" onClick={this.workShopSubmit}>上传WorkShop</button> : null
            }
            <button className="btn-ok" onClick={this.auditSubmit}>发布游戏</button>
            <button className="btn-close" onClick={() => this.closeDialog('{ "result": "-1", "message": "" }')}>取消</button>
          </div>
        </div>
        {
          isShowModal ? (<AuditModal type="auditsubmit" stateValue="提示" modalText={modalText} onClose={this.closeModal} />) : null
        }
      </div>
    );
  }
}

const AuditWithRouter = withRouter(withApollo(AuditSubmit));
delete AuditWithRouter.contextType;
export default AuditWithRouter;













