import React from "react";
import { withRouter, Link } from "react-router-guard";
import { Query, withApollo } from "react-apollo";
import { injectIntl, FormattedMessage } from "react-intl";
import { debounce } from "lodash";
import { Menu, Dropdown, Button, message } from "antd";

import wordFilter from 'utils/sensitive/wordFilter';

import {
  _isInLocalStorage,
  importAll,
  errorHandler,
  setStateAsync,
  _historyHandler,
} from "utils";
import { toggleLoginLoading } from "utils/clientStore";
import { PLATFORM, MODE, ACCOUNT, AUTH_TOKEN, PASSWORD } from "utils/constants";
import { unityJSON, unityListen } from "utils/lib/unity";

import { PlatformContext } from "states/context/PlatformContext";
import {
  LOGIN_MUTATION,
  GET_LOGIN_LOADING,
  CHECK_TOKEN,
  FETCH_MY_INFO,
} from "@gql";

import i18n from "i18n/index.js";

import { SERVER } from "states/APP_STATE";

import LoginMask from "components-lobby/partial/modal/LoginMask";
import AntMessage from "components-lobby/partial/message/AntMessage";

class Login extends React.Component {
  static contextType = PlatformContext;

  constructor(props) {
    super(props);
    this.accountPWDLogin = React.createRef();
    this.state = {
      user: {
        token: "",
        userInfo: {},
        svrInfo: {}
      },
      platform: "",
      account: "",
      password: "",
      openEye: false,
      closable: true, // 登录后的弹窗关闭按钮显示
    };
  }

  async componentDidMount () {
    const that = this;
    let { client, history } = this.props;

    let from = '';
    let state = history.location.state;
    console.log(history.location);
    if (state) {
      if (state.from) {
        from = state.from;
      }
    }

    let platformContext = this.context;
    let account = platformContext.account || _isInLocalStorage(ACCOUNT);
    // let password = platformContext.password || _isInLocalStorage(PASSWORD);
    let platform = platformContext.platform || _isInLocalStorage(PLATFORM);
    let mode = platformContext.mode || _isInLocalStorage(MODE);
    let token = platformContext.token || _isInLocalStorage(AUTH_TOKEN);

    console.log("in login ...", account, platform, token, platformContext);
    if (account && account.indexOf("device:") >= 0) {
      account = "";
      token = "";
    }

    this.setState({
      account,
      // password,
      platform,
      mode,
      from
    });

    let autoLoginTimer = null;
    // if (password) {
    //   console.log("with token  ...");
    //   console.log("with token  ... set password");
    //   toggleLoginLoading("yes", client);
    //   autoLoginTimer = setTimeout(async () => {
    //     that.accountPWDLogin.current.click();
    //     // await this.autoLogin(token, platform);
    //   }, 4000);

    //   this.setState({
    //     autoLoginTimer,
    //   });
    // } else {
    //   toggleLoginLoading("no", client);
    // }

    toggleLoginLoading("no", client);
    window.isDeviceReady = function () {
      return {
        isDeviceReady: "true",
      };
    };

    unityListen("passwordLogin", async function (account, password) {
      if (autoLoginTimer) {
        clearTimeout(autoLoginTimer);
      }
      if (account && password) {
        toggleLoginLoading("yes", client);
        that.setState(
          {
            account,
            password,
          },
          () => {
            autoLoginTimer = setTimeout(async () => {
              that.accountPWDLogin.current.click();
              // await this.autoLogin(token, platform);
            }, 4000);
            // that.accountPWDLogin.current.click();
            that.setState({
              autoLoginTimer,
            });
          }
        );
      } else {
        toggleLoginLoading("no", client);
      }
    });

    unityListen("accountPWDLogin", async function (account, password) {
      console.log("in account password", account, password);
      if (autoLoginTimer) {
        clearTimeout(autoLoginTimer);
      }
      if (account && password) {
        that.setState(
          {
            account,
            password,
          },
          () => {
            that.accountPWDLogin.current.click();
          }
        );
      } else {
        toggleLoginLoading("no", client);
      }
    });
  }

  // 绑定inp输入框事件，清除前后空格
  handleInp = (event, type) => {
    let val = event.target.value;
    val = val.replace(/(^\s*)|(\s*$)/g, "");
    if (type === "account") {
      this.setState({
        account: val,
      });
    } else if (type === "pw") {
      // 判断是否点击了键盘enter事件，调用登录事件
      if (event.key === "Enter") {
        this._landing();
        return;
      }
      this.setState({
        password: val,
      });
    }
  };

  autoLogin = async (token) => {
    const { client } = this.props;
    let i18nMapping = this.context.i18nConfig;
    console.log(i18nMapping, " - - - - - - this is i18n mapping!!!!");

    try {
      let dt = await client.query({
        query: CHECK_TOKEN,
        variables: {},
        fetchPolicy: "no-cache",
      });
      if (dt.data) {
        if (dt.data.checkToken) {
          let dtInfo = await client.query({
            query: FETCH_MY_INFO,
            variables: {},
            fetchPolicy: "no-cache",
          });

          if (dtInfo.data && dtInfo.data.queryMyself) {
            toggleLoginLoading("no", client);
            let myInfo = dtInfo.data.queryMyself;
            let user = {
              token,
              userInfo: myInfo.userInfo,
            };
            this.setState({
              password: "",
            });
            this._landComplete(user);
          } else {
            AntMessage.warn("fetch userInfo error!");
          }
        } else {
          toggleLoginLoading("no", client);
          this.setState({
            account: "",
            password: "",
          });
          AntMessage.warn("Token过期，请重新登录！");
        }
      } else {
        this.setState({
          password: "",
        });
        AntMessage.warn("fetch userInfo error!");
      }
    } catch (error) {
      console.log(error, "");
      this.setState({
        password: "",
      });

      toggleLoginLoading("no", client);
      if (error.graphQLErrors) {
        AntMessage.error(
          errorHandler({
            error,
            mapping: i18nMapping.messages,
          })
        );
      }
    }
  };

  cancelAutoLogin = () => {
    const { client } = this.props;
    const { autoLoginTimer } = this.state;

    if (autoLoginTimer) {
      clearTimeout(autoLoginTimer);
    }
    toggleLoginLoading("no", client);
    this.setState({
      from: 'other'
    });
    // client.writeData({
    //   data: {
    //     loginLoading: 'no'
    //   }
    // })
  };

  _landing = debounce(async () => {
    const that = this;
    const { account, password, platform } = this.state;

    await setStateAsync(
      {
        closable: false,
      },
      that
    );

    if (account) {
      localStorage.setItem(ACCOUNT, account);
    }

    const { client, history, intl } = this.props;

    toggleLoginLoading("yes", client);
    let mode = 'EDITOR';
    if (platform === 'editor') {
      mode = 'EDITOR';
    } else if (platform === 'playerhub') {
      mode = 'HUB'
    } else {
      mode = 'WEB';
    }

    client
      .mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          account,
          password,
          mode,
        },
      })
      .then(async (dt) => {
        console.log(dt, " -  - -this is dt");
        if (dt.data && dt.data.login && dt.data.login.token) {
          let myInfo = dt.data.login;
          let user = {
            token: myInfo.token,
            userInfo: myInfo.userInfo,
            svrInfo: myInfo.svrInfo
          };
          localStorage.setItem(AUTH_TOKEN, user.token);
          localStorage.setItem(PASSWORD, password);

          this.setState({
            user,
          });

          let nickname = user.userInfo && user.userInfo.nickname;
          if (!nickname) {
            _historyHandler({
              jump: {
                pathname: "/landing/set-nickname"
              },
              history
            });
            return;
          }

          let filterResult = await wordFilter(nickname);
          if (filterResult && !filterResult.pass) {
            let warnMsg = intl.messages['new_landing.set_nickname.sensitive'] + `"${filterResult.text}"`;
            AntMessage.warn(warnMsg);
            _historyHandler({
              jump: {
                pathname: "/landing/set-nickname",
                state: {
                  from: 'sensitive'
                }
              },
              history
            });
            return;
          }

          this._landComplete(user);
        } else {
          toggleLoginLoading("no", client);
        }
      })
      .catch((error) => {
        toggleLoginLoading("no", client);
        const { graphQLErrors, networkError } = error;
        if (networkError) {
          return AntMessage.error(this.context.i18nConfig.messages['0000'])
        }
        AntMessage.error(
          errorHandler({
            mapping: this.context.i18nConfig.messages,
            error,
          })
        );
      });
  }, 500);

  _landComplete = (_user) => {
    const { platform, mode, account, password } = this.state;
    const { history, client } = this.props;
    let user = _user || this.state.user;
    const {
      userInfo: {
        userID,
        numberID,
        nickname,
        nameSeq,
        gender,
        hasAvatar,
        avatarJSON,
        status,
        gameID,
        gameName,
        iconURL,
        avatarBodyURL,
        profile,
        followingCount,
        followerCount,
        friendshipState,
      },
      token,
      svrInfo
    } = user;

    client.writeData({
      data: {
        userInfo: {
          userID,
          numberID,
          nickname,
          nameSeq,
          gender,
          hasAvatar,
          avatarJSON,
          status,
          gameID,
          gameName,
          iconURL,
          avatarBodyURL,
          profile,
          followingCount,
          followerCount,
          friendshipState,
          __typename: "userInfo",
        },
      },
    });

    let json = {
      account,
      password,
      userId: userID,
      numberID,
      name: nickname,
      token,
      gender,
      avatarJSON,
      timestamp: svrInfo.unixTimestamp + '',
      imEnvID: svrInfo.imEnvID
    };

    let avatar_json = {
      name: nickname,
      avatarJSON,
      hasAvatar,
    };

    if (mode === "qt") {
      if (window.qtJSON) {
        let jsonString = JSON.stringify({
          token,
          userID,
          account,
          name: nickname,
          avatar: avatarJSON,
          gender,
          timestamp: svrInfo.unixTimestamp + ''
        });
        let json = {
          type: 'emit',
          name: 'onLogin',
          cb: function () {
            return jsonString;
          }
        };
        window.qtJSON(json);
      } else {
        console.log('no qt');
      }

      if (window.qtJSON) {
        let json = {
          type: 'emit',
          name: 'closeDialog',
          cb: function () {
            return JSON.stringify({
              result: 'true'
            });
          }
        };
        window.qtJSON(json);
      } else {
        console.log('no qt');
      }
      return;
    }

    if (platform === "editor") {
      // No need to judge the platform
      console.log("in editor.... login...", json, avatar_json);
      // if (!avatarJSON) {
      //   unityJSON("setAvatar", avatar_json);
      // }

      let isAutoLogin = {
        password: this.state.password,
        autoLogin: true,
      };
      unityJSON("userLogin", json);
      unityJSON("setAutoLogin", isAutoLogin);
      setTimeout(() => {
        toggleLoginLoading("no", client);
      }, 5000);
    } else if (platform === "web") {
      alert("You are in web, please go to editor...");
    } else if (platform === "playerhub") {
      if (
        (gender || gender === 0) &&
        avatarJSON &&
        nickname &&
        nickname.indexOf("pid:") < 0
      ) {
        let isAutoLogin = {
          password: this.state.password,
          autoLogin: true,
        };
        unityJSON("setAutoLogin", isAutoLogin);
        unityJSON("userLogin", {
          ...json,
          ...avatar_json,
          setAvatar: false,
        });
        unityJSON("showFloatWeb", avatar_json);
        _historyHandler({
          jump: "/new-landing/set-nickname",
          history,
        });
      } else {
        let isAutoLogin = {
          password: this.state.password,
          autoLogin: true,
        };
        unityJSON("setAutoLogin", isAutoLogin);
        unityJSON("userLogin", {
          ...json,
          ...avatar_json,
          setAvatar: true,
        });
        // unityJSON("setAvatar", avatar_json);
        _historyHandler({
          jump: "/new-landing/set-nickname",
          history,
        });
      }
      // // No need to judge the platform
      // console.log('in playerhub.... login...', json, avatar_json)
      // if (!avatarJSON) {
      //   unityJSON('setAvatar', avatar_json);
      // }

      // let isAutoLogin = {
      //   autoLogin: true
      // }
      // unityJSON('userLogin', json);
      // unityJSON('setAutoLogin', isAutoLogin);
      // setTimeout(() => {
      //   toggleLoginLoading('no', client);
      // }, 5000);
    }
  };

  _changeLocale = (locale) => {
    console.log('changing locale', ' 0 0 0 0 0 0')
    this.context._updateState({
      i18nConfig: {
        locale: locale,
        messages: i18n[locale],
      },
      i18nMsg: i18n[locale],
    });
  };

  render () {
    const webpackContext = require.context(
      "assets-lobby/img/landing",
      false,
      /\.(png|jpe?g|svg)$/
    );
    const images = importAll(webpackContext);
    const { intl } = this.props;
    const { account, password, openEye, platform, closable, from } = this.state;

    const menu = (
      <Menu className="choose_menu">
        <Menu.Item
          style={{
            lineHeight: "20PX",
          }}
          onClick={() => this._changeLocale("zh")}
        >
          <span>
            {/* 中文 */}
            {intl.messages["locale.zh"]}
            {/* <FormattedMessage id="locale.zh" /> */}
          </span>
        </Menu.Item>
        <Menu.Item
          style={{
            lineHeight: "20PX",
          }}
          onClick={() => this._changeLocale("en")}
        >
          <span>
            {/* 英文 */}
            {intl.messages["locale.en"]}
            {/* <FormattedMessage id="locale.en" /> */}
          </span>
        </Menu.Item>
      </Menu>
    );

    return (
      <>
        {SERVER === "dev" || SERVER === "local" ? (
          <Dropdown overlay={menu} placement="bottomLeft">
            <Button
              style={{
                position: "absolute",
                top: "20PX",
                right: "10PX",
                height: "30PX",
                width: "120PX",
              }}
            >
              {intl.messages["locale.choose_language"]}
              {/* 选择语言 */}
            </Button>
          </Dropdown>
        ) : (
            <></>
          )}

        {
          <Query query={GET_LOGIN_LOADING}>
            {({ data: { loginLoading }, loading, error }) => {
              if (loading) return "Loading...";
              if (error) return "Error";
              // let landing = loginLoading ? <div>loading...</div> : {children}
              console.log(from, '  - - -- this is from');
              let mask = (loginLoading === 'yes');
              return (
                <LoginMask
                  closable={closable}
                  from={from}
                  mask={mask}
                  handelMaskCancel={this.cancelAutoLogin}
                />
              );
            }}
          </Query>
        }

        <div className="log">
          <div className="log-header"></div>

          <div className="log-body">
            <div className="log-body_container">
              <div className="log-body_container--logo">
                <img
                  className="log-body_container--logo-img"
                  alt={`logo`}
                  src={images["logo_u464.svg"]}
                />
                <div className="log-body_container--logo_word">
                  <div className="log-body_container--logo_word-project">
                    {/* PROJECT */}
                    <FormattedMessage id="landing.login.project" />
                  </div>
                  <div className="log-body_container--logo_word-avatar">
                    {/* Da Vinci */}
                    <FormattedMessage id="landing.login.davinci" />
                    <small
                      style={{
                        fontSize: "12PX",
                      }}
                    ></small>
                  </div>
                </div>
              </div>

              <div className="log-body_container--form">
                <div className="form_group">
                  <input
                    className="form-input"
                    type="text"
                    // placeholder="请输入手机号或邮箱"
                    placeholder={intl.messages["landing.login.email"]}
                    value={account || ""}
                    onChange={(e) => this.handleInp(e, "account")}
                    id="account"
                    required
                  />
                </div>
                <div className="form_group">
                  <input
                    className="form-input"
                    type={openEye ? "text" : "password"}
                    placeholder={intl.messages["landing.login.password"]}
                    value={password || ""}
                    onChange={(e) => this.handleInp(e, "pw")}
                    id="password"
                    required
                    onKeyDown={(e) => this.handleInp(e, "pw")}
                  />
                  <div>
                    {openEye ? (
                      <img
                        className="password-eye"
                        alt={`open eye`}
                        src={images[`eye_open_u85.png`]}
                        onClick={(e) => this.setState({ openEye: !openEye })}
                      />
                    ) : (
                        <img
                          className="password-eye"
                          alt={`close eye`}
                          src={images[`eye_x_u83.png`]}
                          onClick={(e) => this.setState({ openEye: !openEye })}
                        />
                      )}
                  </div>
                </div>

                <div className="form_text">
                  <div
                    className="form_text--sms"
                    title={"短信功能暂未开放"}
                    style={{
                      display: "none",
                    }}
                  >
                    <Link
                      to={{
                        pathname: "/landing/sms",
                        search: "?action=sms-login",
                        state: {
                          fromLogin: true,
                        },
                      }}
                      style={{
                        color: "grey",
                        pointerEvents: "none",
                      }}
                    >
                      短信验证码登录
                    </Link>
                  </div>
                  <div className="form_text--lost" title={"密码重置暂未开放"}>
                    <Link
                      to={{
                        pathname: "/landing/get-email-code",
                        search: "?action=sms-reset",
                        state: {
                          fromLogin: true,
                        },
                      }}
                    >
                      {/* 忘记密码？ */}
                      <FormattedMessage id="landing.login.forget_password" />
                    </Link>
                  </div>
                </div>

                <div className="form_btn">
                  <div
                    id={"accountPWDLogin"}
                    ref={this.accountPWDLogin}
                    onClick={this._landing}
                    className="form_btn--login a-btn"
                  >
                    {/* 登录 */}
                    <FormattedMessage id="landing.login.login" />
                  </div>

                  <Link
                    className="form_btn--register a-btn"
                    to={`/landing/email`}
                  >
                    {/* 注册 */}
                    <FormattedMessage id="landing.login.register" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

const LandWithRouter = withRouter(withApollo(injectIntl(Login)));
delete LandWithRouter.contextType;
export default LandWithRouter;
