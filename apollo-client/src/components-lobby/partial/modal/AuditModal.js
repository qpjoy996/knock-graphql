
import React, { Component, Fragment } from 'react';
import { importAll, dateFormat } from "utils";
import { withRouter } from 'react-router-guard';
import { withApollo } from 'react-apollo';
import { Radio } from 'antd';
import gql from 'graphql-tag';
import { PlatformContext } from "states/context/PlatformContext";


const PUBLISH_GAME = gql`
mutation publishGame($input:PublishGameInput!){
    publishGame(input:$input){
      code
    }
  }
`;
class AuditModal extends Component {
  static contextType = PlatformContext;
  constructor(props) {
    super(props);
    this.state = {
      gameID: '',
      version: '',
      versionRadio: 0,
      okModal: false
    }
  }

  componentDidMount () {

  }

  getVersion = () => {
    const { gameID, version, versionRadio } = this.state;
    // console.log(gameID, version);
    // 上架处理
    const { client } = this.props;
    // console.log('0000000', gameID, version);
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
      this.props.closeAllModal(false);
    }).catch((error) => {
      console.log(error)
    })

  }

  closeModal = () => {
    this.setState({
      okModal: false
    })
  }
  showModal = () => {
    const { gameID, version } = this.state;
    if (gameID || version) {
      this.setState({
        okModal: true
      })
    }
  }

  onChangeVersionID = (e) => {
    // console.log('radio checked', e.target.value);
    const value = e.target.value;
    this.setState({
      gameID: value.id,
      version: value.version,
      versionRadio: value
    });
  }

  downVersion = (item) => {
    const { contextApi } = this.props
    const loadUrl = contextApi.replace('graphql', 'download_asset?id=' + item.assetID)
    let idContent = item.name + '&' + item.version + '&' + loadUrl;
    const downLoadUrl = window.location.origin + '/my/gameDownLoad?id=' + idContent;
    if (window.qtJSON) {
      let json = {
        type: 'emit',
        name: 'jumpToBrowser',
        cb: function () {
          return downLoadUrl
        }
      }
      window.qtJSON(json);
    }
  }


  render () {
    const webpackContext = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    const { type, stateValue, onOk, onClose, versionItem, gameHeadInfo, contextApi, modalText } = this.props
    const { versionRadio, okModal, version } = this.state
    // let icon = <img src={images['icon_warn.png']} alt='' className='audit-modal-icon' />
    let icon = ''
    // console.log(versionItem);
    let beReportedItem = null;
    if (gameHeadInfo && gameHeadInfo.auditInfo) {
      const auditUndoPublishReason = gameHeadInfo.auditInfo.auditUndoPublishReason
      const auditReason = gameHeadInfo.auditInfo.auditReason
      if (auditUndoPublishReason && gameHeadInfo.publicStatus === "CLOSED") beReportedItem = auditUndoPublishReason
      if (auditReason && gameHeadInfo.auditInfo.auditResult === "REJECTED") beReportedItem = auditReason
    }
    return (
      <div className="audit-modal">
        {
          okModal ? (
            // 是否确认恢复的版本
            <div className="audit-modal-opacity" style={{ padding: "20px" }}>
              <div className="audit-modal-warning">
                <p className="iconP-game">{icon}您确定要恢复版本为<span> V{version} </span>的游戏吗 ？</p>
              </div>
              <div className="audit-modal-btn">
                <button className="btn-close" onClick={this.closeModal}>退出</button>
                <button className="btn-ok" onClick={this.getVersion}>确定</button>
              </div>
            </div>
          ) :
            (
              <div className="audit-modal-opacity">
                <div className="audit-modal-opacity-title">{type === "Error" ? "提示:" : stateValue}<span onClick={onClose}>✕</span></div>
                <div className="audit-modal-opacity-content">
                  {
                    type === 'Warning' ? (
                      <div className="audit-modal-warning">
                        {
                          stateValue === '下架并删除游戏' ? (
                            <p className="iconP-game">{icon}您确定要<span> {stateValue} </span>吗(删除后游戏数据将不会被保留)？</p>
                          ) : (
                              <p>{icon}您确定要<span> {stateValue} </span>吗？</p>
                            )
                        }
                      </div>
                    ) : null
                  }
                  {
                    type === 'Notify' ? (
                      <div className="audit-modal-notify">
                        <p className="iconP-game">{icon}您的游戏存在以下情况，被{gameHeadInfo.publicStatus === "CLOSED" ? stateValue : '驳回'}</p>
                        <ul>
                          {
                            beReportedItem ? (
                              beReportedItem.map((item, index) => {
                                return (
                                  <Fragment key={item + index}>
                                    {item === "ERROR_GAMEINFO" ? <li>游戏名称、截图、简介不符合规范</li> : null}
                                    {item === "ILLEGAL" ? <li>游戏含有政治、色情、敏感、暴力血腥等内容</li> : null}
                                    {item === "CANNOT_ENTER" ? <li>无法进入游戏</li> : null}
                                    {item === "INFRINGEMENT" ? <li>涉嫌侵权</li> : null}
                                    {item === "OTHERS" ? <li>其他</li> : null}
                                  </Fragment>
                                )
                              })
                            ) : null
                          }
                        </ul>
                      </div>
                    ) : null
                  }
                  {
                    type === "Error" ? (
                      <div>
                        <p>{stateValue}!</p>
                      </div>
                    ) : null
                  }
                  {
                    type === 'Version' && versionItem ? (
                      <div className="audit-modal-version">
                        <p>{icon}请选择一个<span>{stateValue}</span></p>
                        <Radio.Group className="checkbox-group-version" onChange={this.onChangeVersionID} value={versionRadio}>
                          {
                            versionItem.map((item, index) => {
                              return (
                                <Fragment key={item.version}>
                                  {
                                    // 可以下载的版本：
                                    !item.auditInfo.auditUndoPublishReason
                                      && item.auditInfo.auditUndoPublishFromVersion === '' ? (
                                        // 可选中恢复的版本
                                        <Radio value={item} >
                                          <div>
                                            <span>V{item.version} {dateFormat('MM/dd hh:mm', new Date(item.lastChangeTime))}</span>
                                            <a onClick={() => { this.downVersion(item) }}>下载</a>
                                          </div>
                                        </Radio>
                                      ) : (
                                        // 仅提供下载功能
                                        <div className="ant-radio-wrapper nopublish-Reason">
                                          <span>V{item.version} {dateFormat('MM/dd hh:mm', new Date(item.lastChangeTime))}</span>
                                          <a onClick={() => { this.downVersion(item) }}>下载</a>
                                        </div>
                                      )
                                  }
                                </Fragment>
                              )
                            })
                          }
                        </Radio.Group>
                      </div>
                    ) : null
                  }
                  {
                    type === 'auditsubmit' ? (
                      <div className="audit-modal-warning">
                        <p>{modalText}</p>
                      </div>
                    ) : null
                  }
                  <div className="audit-modal-btn">
                    {
                      ['Notify', 'auditsubmit', "Error"].indexOf(type) > -1 ? <button className="btn-ok" onClick={onClose}>确定</button> : (
                        <>
                          <button className="btn-close" onClick={onClose}>退出</button>
                          <button className="btn-ok" onClick={type === 'Version' ? this.showModal : onOk}>确定</button>
                        </>
                      )
                    }

                  </div>
                </div>
              </div>)
        }
      </div>
    );
  }
}

const AuditModalWithRouter = withRouter(withApollo(AuditModal));
delete AuditModalWithRouter.contextType;
export default AuditModalWithRouter;
