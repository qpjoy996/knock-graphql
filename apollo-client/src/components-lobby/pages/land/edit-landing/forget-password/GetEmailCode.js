import React from "react";
import { _historyHandler, importAll, errorHandler } from "utils";
import { withRouter, Link } from "react-router-guard";
import { withApollo } from "react-apollo";
import { injectIntl, FormattedMessage } from "react-intl";
import gql from "graphql-tag";
import * as qs from "query-string";

import { validateEmail } from "utils/validatorHandler";

import AntMessage from "components-lobby/partial/message/AntMessage";

import NavTop from "components-lobby/phone-partial/nav-top/NavTop";

import { PlatformContext } from "states/context/PlatformContext";

const CHECK_ACCOUNT = gql`
  query CheckAccount($email: String!) {
    checkAccount(email: $email) {
      exist
    }
  }
`;

class GetEmailCode extends React.Component {
  static contextType = PlatformContext;

  state = {
    email: "",
  };

  constructor(props) {
    super(props);
  }

  async componentDidMount() {}

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  emailCheck = async (email) => {
    let i18nMapping =
      this.context.i18nConfig && this.context.i18nConfig.messages;
    console.log(i18nMapping, " - - - - - - this is i18n mapping!!!!");
    return new Promise(async (resolve, reject) => {
      if (!email) {
        return resolve({
          pass: false,
          msg: i18nMapping["EMAIL_REQUIRED"],
        });
      }
      const emailValidator = validateEmail(email);

      if (!emailValidator.valid) {
        return resolve({
          pass: false,
          msg: i18nMapping[emailValidator.code],
        });
      }

      try {
        let dt = await this.props.client.query({
          query: CHECK_ACCOUNT,
          variables: {
            email,
          },
        });

        if (dt.data && dt.data.checkAccount) {
          let exist = dt.data.checkAccount.exist;
          if (exist) {
            return resolve({
              pass: true,
              msg: i18nMapping["EMAIL_VALID"],
            });
          } else {
            return resolve({
              pass: false,
              msg: i18nMapping["EMAIL_NOT_EXIST"],
            });
          }
        } else {
          return resolve({
            pass: false,
            msg: "something wrong!",
          });
        }
      } catch (error) {
        console.log(error);
        // if (error.graphQLErrors) {
        //     error.graphQLErrors.map((err) => {
        //         if (err.extensions && err.extensions.errcode) {
        //             const errcode = err.extensions.errcode;
        //             console.log(errcode, ' - - - ', errorHandler(errcode));
        //             AntMessage.error(errorHandler(errcode));
        //         }
        //     })
        // }
        return reject({
          pass: false,
          msg: i18nMapping["EMAIL_ERROR"],
        });
      }
    });
  };

  goGetEmailCode = async () => {
    const { email } = this.state;
    const { history } = this.props;

    let dt = await this.emailCheck(email);
    if (dt.pass) {
      _historyHandler({
        jump: {
          pathname: "/landing/verify-email-code",
          state: {
            email,
          },
        },
        history,
      });
    } else {
      AntMessage.warn(dt.msg);
    }
  };

  switchVerify = (e) => {
    const { history } = this.props;
    _historyHandler({
      jump: "/new-landing/get-phone-code",
      history,
    });
  };

  render() {
    const webpackContext = require.context(
      "assets-lobby/img/landing",
      false,
      /\.(png|jpe?g|svg)$/
    );
    const images = importAll(webpackContext);

    const {intl} = this.props;
    const { email } = this.state;

    return (
      <div className="new-forget">
        <NavTop text={intl.messages['landing.get_email_code.title']} show={"left"} />

        <div className="new-forget-container">
          <div className="new-forget-container--inner">
            <div className="">
              <div className="text-white text-size-16">
                {/* 验证码将发送到邮箱 */}
                <FormattedMessage id="landing.get_email_code.verify_code" />
              </div>

              <input
                className="form-input"
                type="text"
                // placeholder="请输入手机号"
                placeholder={intl.messages['landing.verify_email_code.input_email']}
                value={email}
                onChange={(e) =>
                  this.setState({
                    email: e.target.value,
                  })
                }
                id="email"
                required
              />
            </div>

            <div className="text-grey">
              {/* 如果长时间未收到验证码，请检查是否将运营商拉黑 */}
              <FormattedMessage id="landing.get_email_code.tip" />
            </div>

            <div className="brown-btn">
              <a onClick={(e) => this.goGetEmailCode(e)} className="a-btn">
                <FormattedMessage id="landing.get_email_code.get_code" />
                {/* 获取验证码 */}
              </a>
            </div>

            {/* <div
              className="text-blue"
              style={{
                color: "grey",
                pointerEvents: "none",
              }}
              onClick={(e) => this.switchVerify(e)}
            >
              <a
                className="text-size-16"
                style={{
                  // color: 'grey',
                  pointerEvents: "none",
                }}
                href
              >
                切换手机验证
              </a>
            </div> */}
          </div>
        </div>
      </div>
    );
  }
}

const GetEmailCodeWithRouter = withRouter(withApollo(injectIntl(GetEmailCode)));
delete GetEmailCodeWithRouter.contextType;
export default GetEmailCodeWithRouter;
