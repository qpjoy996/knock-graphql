import React, { Component } from "react";
import { withApollo } from "react-apollo";
import { withRouter } from "react-router-guard";
import { injectIntl, FormattedMessage } from "react-intl";
import AntMessage from "components-lobby/partial/message/AntMessage";

import { _historyHandler, charCodeLen, errorHandler } from "utils";
import { unityJSON } from "utils/lib/unity";
import { AUTH_TOKEN } from "utils/constants";
import { FETCH_MY_INFO, SET_NICKNAME_MUTATION } from "@gql";
import { PlatformContext } from "states/context/PlatformContext";

import wordFilter from 'utils/sensitive/wordFilter';

class SetNickname extends Component {
  static contextType = PlatformContext;

  constructor(props) {
    super(props);
    this.state = {
      platform: "",
      nickname: "",
      from: ''
    };
  }

  componentDidMount() {
    const _this = this;
    const nickname = localStorage.getItem("NICKNAME");
    let platform = localStorage.getItem("PLATFORM");

    const {
      history
    } = this.props;
    
    let from = '';
    let state = history.location.state;
    if(state) {
      if(state.from) {
        from = state.from;
      }
    }

    _this.setState({
      nickname,
      platform,
      from
    });
  }

  handleNickname = (e) => {
    let nickname = e.target.value;
    // 正则去掉空格
    nickname = nickname.replace(/\s*/g, "");
    this.setState({
      nickname: nickname,
    });
  };

  setNicknameLast = (e) => {
    const { nickname, from } = this.state;
    const { history } = this.props;

    if(from === 'sensitive') {
      _historyHandler({ 
        jump: {
          pathname: "/landing/login",
          state: {
              from: 'set-nickname'
          }
        }, history });
      return;
    }

    localStorage.setItem("NICKNAME", nickname);
    _historyHandler({ step: "last", history });
  };

  _userLogin = (account, jwtToken, userId, nickname, gender) => {
    let json = {
      account,
      token: jwtToken,
      userId: userId,
      name: nickname,
      gender: gender,
    };
    unityJSON("userLogin", json);
  };

  setNicknameNext = async(e) => {
    const { platform, nickname } = this.state;

    const { history, client, intl } = this.props;

    if (!nickname) {
      return AntMessage.warn(intl.messages["landing.nickname.input"]);
    }
    const nameRegExp = /^[\u4e00-\u9fa5_a-zA-Z0-9]+$/;
    let nameLen = charCodeLen(nickname);
    if (!nameRegExp.test(nickname) || nameLen < 4 || nameLen > 20) {
      AntMessage.error(
        intl.messages['landing.nickname.validate']
      );
      return;
    }

    let filterResult = await wordFilter(nickname);
    if(filterResult && !filterResult.pass) {
      let warnMsg = intl.messages['new_landing.set_nickname.sensitive'] + `"${filterResult.text}"`;
      return AntMessage.warn(warnMsg);
    }

    const token = localStorage.getItem(AUTH_TOKEN);

    client
      .query({
        query: FETCH_MY_INFO,
        variables: {},
        fetchPolicy: "no-cache",
      })
      .then((dtInfo) => {
        if (dtInfo.data && dtInfo.data.queryMyself) {
          let {
            email,
            userInfo: { userID, gender, hasAvatar, avatarJSON },
          } = dtInfo.data.queryMyself;

          let avatar_json = {
            hasAvatar,
            avatarJSON,
          };

          let json = {
            account: email,
            token,
            userId: userID,
            name: nickname,
            gender,
            avatarJSON,
          };

          this.props.client
            .mutate({
              mutation: SET_NICKNAME_MUTATION,
              variables: {
                nickname,
              },
            })
            .then((dt) => {
              if (dt.data && dt.data.setUserNickname) {
                if (dt.data.setUserNickname.code === 0) {
                  localStorage.setItem("NICKNAME", nickname);
                  localStorage.removeItem(AUTH_TOKEN);
                  _historyHandler({ jump: "/landing/login", history });

                  // if (platform === "playerhub") {
                  //   unityJSON("setAvatar", avatar_json);
                  //   this._userLogin(email, token, userID, nickname, gender);

                    
                  //   AntMessage.success(intl.messages['landing.nickname.set_success']);
                  // } else if (platform === "editor") {
                  //   if (!avatarJSON) {
                  //     unityJSON("setAvatar", avatar_json);
                  //   }

                  //   let isAutoLogin = {
                  //     autoLogin: true,
                  //   };
                  //   unityJSON("userLogin", json);
                  //   unityJSON("setAutoLogin", isAutoLogin);
                  //   _historyHandler({ jump: "/landing/login", history });
                  // } else {
                  //   _historyHandler({ jump: "/landing/login", history });
                  //   AntMessage.success(intl.messages['landing.nickname.set_success']);
                  // }
                }else {
                  AntMessage.error('data issues');
                }
              } else {
                AntMessage.error(intl.messages['data.issue']);
              }
            })
            .catch((error) => {
              console.log(error);
              if (error.graphQLErrors) {
                AntMessage.error(
                  errorHandler({
                    mapping: this.context.i18nConfig.messages,
                    error,
                  })
                );
              }
            });
        }
      })
      .catch((error) => {
        console.log(error);
        if (error.graphQLErrors) {
          AntMessage.error(
            errorHandler({
              mapping: this.context.i18nConfig.messages,
              error,
            })
          );
        }
      });
  };

  render() {
    const { intl } = this.props;
    const { nickname } = this.state;

    return (
      <div className="log">
        <div className="log-header"></div>

        <div className="log-body set-nickname">
          <div className="log-body_container">
            <div className="log-body_container--logo">
              <div className="tip-text">
                {/* 请输入昵称 */}
                <FormattedMessage id="landing.nickname.input" />
              </div>
            </div>

            <div className="log-body_container--form">
              <div className="form_group">
                <input
                  className="form-input input-nickname"
                  placeholder={intl.messages["landing.nickname.input"]}
                  type="text"
                  value={nickname || ""}
                  onChange={this.handleNickname}
                />
              </div>
            </div>
            <div className="log-body_container--footer">
              <div className="footer--last_next">
                <div
                  className="footer--last"
                  onClick={(e) => this.setNicknameLast(e)}
                >
                  {/* 上一步 */}
                  <FormattedMessage id="landing.verify_email_code.pre" />
                </div>
                <div
                  className="footer--next a-btn"
                  onClick={(e) => this.setNicknameNext(e)}
                >
                  {/* 下一步 */}
                  <FormattedMessage id="landing.verify_email_code.next" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const SetNicknameWithRouter = withRouter(withApollo(injectIntl(SetNickname)));
delete SetNicknameWithRouter.contextType;
export default SetNicknameWithRouter;
