import React, { Component } from 'react';
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

class TestAuditModal extends Component {
  static contextType = PlatformContext;
  constructor(props) {
    super(props);
    this.state = {
      gameID: '',
      version: ''
    }
  }

  getVersion = () => {
    // 上架处理
    const { gameID, version } = this.state;
    const { client } = this.props;
    console.log('0000000', gameID, version);
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

  onChangeVersionID = (e) => {
    console.log('radio checked', e.target.value);
    const value = e.target.value;
    this.setState({
      gameID: value.id,
      version: value.version,
    });
  }

  render () {
    const webpackContext = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    const { type, stateValue, onOk, onClose, versionItem, gameHeadInfo, contextApi } = this.props
    let icon = <img src={images['icon_warn.png']} alt='' className='audit-modal-icon' />
    console.log(gameHeadInfo);
    return (
      <div className="audit-modal">
        <div className="audit-modal-opacity">
          {
            type === 'Warning' ? (
              <div className="audit-modal-warning">
                {
                  stateValue === '下架并删除游戏' ? (
                    <p className="iconP-game">{icon}您确定要<span>{stateValue} </span>吗 (删除后游戏数据将不会被保留)？</p>
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
                <p className="iconP-game">{icon}您的游戏存在以下情况，{stateValue}</p>
                <ul>
                  {
                    gameHeadInfo.auditInfo && gameHeadInfo.auditInfo.auditUndoPublishReason ? (
                      gameHeadInfo.auditInfo.auditUndoPublishReason.map((item, index) => {
                        return (
                          <>
                            {item === "ERROR_GAMEINFO" ? <li>游戏名称、截图、简介不符合规范</li> : null}
                            {item === "ILLEGAL" ? <li>游戏含有政治、色情、敏感、暴力血腥等内容</li> : null}
                            {item === "CANNOT_ENTER" ? <li>无法进入游戏</li> : null}
                            {item === "INFRINGEMENT" ? <li>涉嫌侵权</li> : null}
                            {item === "OTHERS" ? <li>其他</li> : null}
                          </>
                        )
                      })) : null
                  }
                </ul>
              </div>
            ) : null
          }
          {
            type === 'Version' && versionItem ? (
              <div className="audit-modal-version">
                <p>{icon}请选择一个<span>{stateValue}</span></p>
                {/* <div> */}
                <Radio.Group className="checkbox-group-version" >
                  {
                    versionItem.map((item, index) => {
                      const downLoadUrl = contextApi.replace('graphql', 'download_asset?id=' + item.assetID)
                      console.log(item.auditInfo.auditResult);
                      return (
                        <>
                          {
                            item.auditInfo.auditResult === 'PASSED' ? (
                              <Radio value={index} onChange={this.onChangeVersionID} value={item} key={item.version}>
                                <div>
                                  <span>V{item.version} {dateFormat('MM/dd hh:mm', new Date(item.lastChangeTime))}</span>
                                  <a href={downLoadUrl} download={downLoadUrl}> 下载</a>
                                </div>
                              </Radio>
                            ) : (
                                null
                              )
                          }
                        </>
                      )
                    })
                  }
                </Radio.Group>
                {/* </div> */}
              </div>
            ) : null
          }
          <div className="audit-modal-btn">
            {
              type === 'Notify' ? <button className="btn-ok" onClick={onClose}>确定</button> : (
                <>
                  <button className="btn-close" onClick={onClose}>取消</button>
                  <button className="btn-ok" onClick={type === 'Version' ? this.getVersion : onOk}>确定</button>
                </>
              )
            }
          </div>
        </div>

        {/* <div className="audit-modal-opacity"></div> */}
      </div>
    );
  }
}

const TestAuditModalWithRouter = withRouter(withApollo(TestAuditModal));
delete TestAuditModalWithRouter.contextType;
export default TestAuditModalWithRouter;