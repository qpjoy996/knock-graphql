import React, { Component } from "react";
import { withApollo } from "react-apollo";
import { debounce } from "lodash";
import { Link, withRouter } from "react-router-guard";
import { injectIntl, FormattedMessage } from "react-intl";

import AntMessage from "components-lobby/partial/message/AntMessage";

import { importAll, _isTrueText, _historyHandler, errorHandler } from "utils";
import { validateEmail } from "utils/validatorHandler";

import { CHECK_ACCOUNT_MAIL, SEND_EMAIL_VERIFICATION, CHECK_CODE } from "@gql";
import { PlatformContext } from "states/context/PlatformContext";

class RegisterEmail extends Component {
  static contextType = PlatformContext;

  constructor(props) {
    super(props);
    this.state = {
      emailVal: "",
      emailTip: "",
      emailValid: true,
      email_code: "",
      is_sending_email: false,
      _count: 30,
    };
  }

  async componentDidMount() {

    const {
      history
    } = this.props;

    // 查看是否已经存下了email和code，并射到state
    let emailVal = localStorage.getItem("REGISTER_EMAIL");
    let email_code = localStorage.getItem("EMAIL_CODE");
    if (emailVal) {
      this.setState({
        emailVal,
        email_code,
      });
    }

    let is_sending_email = localStorage.getItem("IS_SENDING_EMAIL");
    let _count = localStorage.getItem("COUNT_EMAIL");
    if (_isTrueText(is_sending_email)) {
      this._sendEmailStatus(_count, is_sending_email, emailVal);
    }
  }

  // 绑定inp输入框事件，清除前后空格
  handleInp = (event, type) => {
    let val = event.target.value;
    val = val.replace(/(^\s*)|(\s*$)/g, "");
    if (type === "email") {
      this.setState(
        {
          emailVal: val,
        },
        () => {
          this.emailValidate();
        }
      );
    } else if (type === "code") {
      this.setState({
        email_code: val,
      });
    }
  };

  // 设置提醒
  setEmailRemind = (exist, cb) => {
    const {intl} = this.props;
    if (exist) {
      return this.setState({
        emailValid: false,
        emailTip: intl.messages["landing.email.exists"],
      });
    } else {
      this.setState({
        emailValid: true,
        emailTip: "Email validate success.",
      });
      cb && cb();
    }
  };
  // 验证邮箱的有效性
  emailValidate = (e) => {
    const {intl} = this.props;
    let { emailVal } = this.state;
    this.registerEmailCheck(emailVal, (emailVal, dt) => {
      console.log("dt", dt);
      if (dt.data && dt.data.checkAccount) {
        let exist = dt.data.checkAccount.exist;
        this.setEmailRemind(exist);
      } else {
        AntMessage.error(
          intl.messages['data.issue']
        );
      }
    });
  };

  // 请求接口验证邮箱可用性
  registerEmailCheck = debounce((registerEmail, cb) => {
    const {intl} = this.props;
    const that = this;
    if (!registerEmail) {
      return AntMessage.error(intl.messages["landing.verify_email_code.input_email"]);
    }

    const emailValidator = validateEmail(registerEmail);
    if (!emailValidator.valid) {
      let emailTip = '';
      if(emailValidator.code === 'LILITH_EMAIL_REQUIRED') {
        emailTip = intl.messages['landing.login.lilith_email_required']
      }else {
        emailTip = intl.messages['landing.login.email_invalid']
      }
      return this.setState({
        emailValid: false,
        emailTip
      });
    }
    that.props.client
      .query({
        query: CHECK_ACCOUNT_MAIL,
        fetchPolicy: "network-only",
        variables: {
          email: registerEmail,
        },
      })
      .then((dt) => {
        console.log(0, dt);
        cb && cb(registerEmail, dt);
      })
      .catch((error) => {
        console.log("er", error);
      });
  }, 800);

  // 点击发送验证码
  sendEmail = debounce((_count, is_sending_email, email) => {
    const { intl } = this.props;
    email = email || this.state.emailVal;

    if (!email) {
      return AntMessage.error(
        intl.messages["landing.verify_email_code.input_email"]
      );
    }

    this._sendEmailStatus(_count, is_sending_email, email, this._sendEmailCode);
  }, 500);

  // 更新倒计时状态
  _sendEmailStatus = (_count, is_sending_email, email, _sendEmailCode) => {
    const { intl } = this.props;
    email = email || this.state.emailVal;
    if (!email) {
      return AntMessage.error(
        intl.messages["landing.verify_email_code.input_email"]
      );
    }

    this.registerEmailCheck(email, (email, dt) => {
      console.log("dr111", dt);
      if (dt.data && dt.data.checkAccount) {
        let exist = dt.data.checkAccount.exist;
        this.setEmailRemind(exist);

        this.setState({
          _count,
          is_sending_email,
        });

        localStorage.setItem("IS_SENDING_EMAIL", is_sending_email);
        localStorage.setItem("COUNT_EMAIL", _count);
        localStorage.setItem("REGISTER_EMAIL", email);

        if (_sendEmailCode) {
          setTimeout(() => {
            _sendEmailCode(email);
          }, 1000);
        }

        const timer = setInterval(() => {
          this.setState(
            (prevState) => {
              const _count = prevState._count - 1;
              localStorage.setItem("COUNT_EMAIL", _count);
              return {
                _count,
              };
            },
            () => {
              if (this.state._count <= 0) {
                clearInterval(timer);
                localStorage.setItem("COUNT_EMAIL", 60);
                localStorage.setItem("IS_SENDING_EMAIL", false);
                this.setState({
                  _count: 60,
                  is_sending_email: false,
                });
              }
            }
          );
        }, 1000);
      } else {
        AntMessage.error("数据错误，请联系管理员！");
      }
    });
  };

  // 发送验证码请求
  _sendEmailCode = async (email) => {
    try {
      let dt = await this.props.client.mutate({
        mutation: SEND_EMAIL_VERIFICATION,
        variables: {
          email,
        },
      });
      let code = dt.data.sendVrfCodeEmail.code;
      if (code === 0) {
        AntMessage.success("邮件验证码已发送");
      }
    } catch (error) {
      if (error.graphQLErrors) {
        AntMessage.error(
          errorHandler({
            mapping: this.context.i18nConfig.messages,
            error,
          })
        );
      }
    }
  };

  // 点击进入下一步
  registerEmailNext = () => {
    const { emailVal, email_code } = this.state;

    const { history, client, intl } = this.props;

    this.registerEmailCheck(emailVal, (registerEmail, dt) => {
      if (!email_code) {
        return AntMessage.error(intl.messages['landing.verify_email_code.input_code']);
      }
      if (dt.data && dt.data.checkAccount) {
        const exist = dt.data.checkAccount.exist;
        this.setEmailRemind(exist, () => {
          client
            .query({
              query: CHECK_CODE,
              variables: {
                target: emailVal,
                vrfCode: email_code,
              },
            })
            .then((dt) => {
              if (dt.data) {
                if (dt.data.checkVrfCode === true) {
                  AntMessage.success(intl.messages['landing.verify_email_code.code_success']);

                  localStorage.setItem("REGISTER_EMAIL", registerEmail);
                  localStorage.setItem("EMAIL_CODE", email_code);

                  _historyHandler({
                    jump: "/landing/set-password?from=email",
                    history,
                  });
                } else {
                  return AntMessage.error(intl.messages['landing.verify_email_code.code_error']);
                }
              }
            })
            .catch((error) => {
              if (error.graphQLErrors) {
                AntMessage.error(
                  errorHandler({
                    mapping: this.context.i18nConfig.messages,
                    error,
                  })
                );
              }
            });
        });
      } else {
        AntMessage.error(intl.messages['data.issue']);
      }
    });
  };

  render() {
    const webpackContext = require.context(
      "assets-lobby/img/landing",
      false,
      /\.(png|jpe?g|svg)$/
    );
    const images = importAll(webpackContext);

    const { intl, history } = this.props;
    const {
      emailVal,
      emailValid,
      emailTip,
      email_code,
      _count,
      is_sending_email,
    } = this.state;

    return (
      <div className="log">
        <div className="log-header"></div>
        <div className="log-body register-email">
          <div className="log-body_container">
            <div className="log-body_container--logo">
              <img
                className="log-body_container--logo-img"
                alt={`logo`}
                src={images["logo_u464.svg"]}
              />
              <div className="log-body_container--logo_word">
                <div className="log-body_container--logo_word-project">
                  PROJECT
                </div>
                <div className="log-body_container--logo_word-avatar">
                  DaVinci
                </div>
              </div>
            </div>

            <div className="log-body_container--form">
              <div className="form_group">
                <input
                  className={
                    emailValid ? "form-input" : "form-input form-input_invalid"
                  }
                  type="text"
                  value={emailVal || ""}
                  placeholder={
                    intl.messages["landing.verify_email_code.input_email"]
                  }
                  onChange={(e) => this.handleInp(e, "email")}
                  //  onBlur={this.emailValidate}
                  id="register_email"
                />
                <label htmlFor="register_email">{emailTip}</label>
              </div>

              <div className="form_group">
                <input
                  className="form-input area-sms"
                  type="text"
                  placeholder={
                    intl.messages["landing.verify_email_code.input_code"]
                  }
                  value={email_code || ""}
                  onChange={(e) => this.handleInp(e, "code")}
                  maxLength="6"
                />

                <div
                  className="a-btn get-area-sms"
                  style={
                    is_sending_email
                      ? {
                          backgroundColor: "#FFF",
                          color: "#999",
                          pointerEvents: "none",
                        }
                      : {}
                  }
                  onClick={(e) => this.sendEmail(60, true)}
                >
                  {is_sending_email ? (
                    <>
                      <FormattedMessage id="landing.verify_email_code.reget" />
                      {_count}...
                    </>
                  ) : (
                    intl.messages["landing.get_email_code.get_code"]
                  )}
                </div>
              </div>

              <div
                className="form_text"
                title={"手机注册功能暂未开放"}
                style={{
                  display: "none",
                }}
              >
                <Link
                  to={"/landing/sms"}
                  style={{
                    color: "grey",
                    pointerEvents: "none",
                  }}
                >
                  使用手机注册
                </Link>
              </div>
            </div>
            <div className="log-body_container--footer">
              <div className="footer--last_next">
                <div
                  className="footer--last"
                  onClick={(e) =>
                    _historyHandler({
                      step: "last",
                      history: this.props.history,
                    })
                  }
                >
                  <FormattedMessage id="landing.verify_email_code.pre" />
                  {/* 上一步 */}
                </div>

                <div
                  className="footer--next a-btn"
                  onClick={(e) => this.registerEmailNext(e)}
                >
                  <FormattedMessage id="landing.verify_email_code.next" />
                  {/* 下一步 */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const RegisterEmailWithRouter = withRouter(
  withApollo(injectIntl(RegisterEmail))
);
delete RegisterEmailWithRouter.contextType;
export default RegisterEmailWithRouter;
