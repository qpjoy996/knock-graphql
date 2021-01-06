import React from "react";
import { withApollo } from "react-apollo";
import { Link, withRouter } from "react-router-guard";
import { debounce } from "lodash";
import gql from "graphql-tag";
import * as qs from "query-string";
import { injectIntl, FormattedMessage } from "react-intl";

import { importAll, _historyHandler } from "utils";

import AntMessage from "components-lobby/partial/message/AntMessage";

import NavTop from "components-lobby/phone-partial/nav-top/NavTop";
import {
  EMAIL_CODE,
  REGISTER_EMAIL,
  REGISTER_PHONE,
  SMS_CODE,
  AUTH_TOKEN,
} from "utils/constants";
import { validatePassword } from "utils/validatorHandler";

import { PlatformContext } from "states/context/PlatformContext";

const RESET_PASSWORD_WITH_PHONE = gql`
  mutation resetPasswordWithPhone(
    $phone: String!
    $vrfCode: String!
    $newPassword: String!
  ) {
    resetPasswordWithPhone(
      phone: $phone
      vrfCode: $vrfCode
      newPassword: $newPassword
    ) {
      code
    }
  }
`;

const RESET_PASSWORD_WITH_EMAIL = gql`
  mutation resetPasswordWithEmail(
    $email: String!
    $vrfCode: String!
    $newPassword: String!
  ) {
    resetPasswordWithEmail(
      email: $email
      vrfCode: $vrfCode
      newPassword: $newPassword
    ) {
      code
    }
  }
`;

class NewPassword extends React.Component {
  static contextType = PlatformContext;

  state = {
    password: "",
    passwordA: "",
    passwordPass: true,
    passwordAPass: true,
    passwordTip: "",
    passwordATip: "",
    from: "sms",
    isRegisterWithEmail: false,
    account: "",
    phone: "",
    email: "",
    vrfCode: "",
  };

  constructor(props) {
    super(props);
  }

  async componentDidMount() {
    const { history, intl } = this.props;

    let state = history.location.state;
    if (state) {
      if (state.vrfCode) {
        this.setState({
          vrfCode: state.vrfCode,
        });
      }
      if (state.email) {
        this.setState({
          email: state.email,
        });
      } else if (state.phone) {
        this.setState({
          phone: state.phone,
        });
      } else {
        AntMessage.warn(intl.messages["landing.new_password.no_account"]);
      }
    } else {
      AntMessage.warn(intl.messages["landing.new_password.no_account"] + "!");
    }
  }

  _passwordCheck = debounce((password) => {
    const i18nMapping = this.context.i18nConfig.messages;
    const validObj = validatePassword(password);
    this.setState({
      password,
      passwordPass: validObj.valid,
      passwordTip: i18nMapping[validObj.code] || "",
    });
  }, 500);

  _validatePassword = (e) => {
    const password = e.target.value;

    this.setState({
      password,
    });

    this._passwordCheck(password);
  };

  _passwordACheck = debounce((passwordA) => {
    // const validObj = validatePassword(passwordA);
    const i18nMapping = this.context.i18nConfig.messages;
    const { password } = this.state;
    this.setState({
      passwordA,
      passwordAPass: password === passwordA,
      passwordATip: i18nMapping["PWD_AB_NOT_MATCH"],
    });
  }, 500);

  _validatePasswordA = (e) => {
    const passwordA = e.target.value;

    this.setState({
      passwordA,
    });

    this._passwordACheck(passwordA);
  };

  resetPasswordSubmit = (e) => {
    const { email, phone, vrfCode, password, passwordA } = this.state;

    const { history, client, intl } = this.props;

    if (!email && !phone) {
      return AntMessage.warn(
        intl.messages["landing.new_password.account_required"]
      );
    }

    if(password !== passwordA) {
      return AntMessage.warn(intl.messages['landing.password.not_equal']);
    }

    const validObj = validatePassword(password);
    if(!validObj.valid) {
      return AntMessage.warn(intl.messages[validObj.code])
    }

    client
      .mutate({
        mutation: email ? RESET_PASSWORD_WITH_EMAIL : RESET_PASSWORD_WITH_PHONE,
        variables: email
          ? {
              email,
              vrfCode,
              newPassword: password,
            }
          : {
              phone,
              vrfCode,
              newPassword: password,
            },
      })
      .then((dt) => {
        if (
          (dt.data &&
            dt.data.resetPasswordWithPhone &&
            dt.data.resetPasswordWithPhone.code === 0) ||
          (dt.data &&
            dt.data.resetPasswordWithEmail &&
            dt.data.resetPasswordWithEmail.code === 0)
        ) {
          AntMessage.success(
            intl.messages["landing.new_password.reset_success"]
          );
          _historyHandler({
            jump: "/landing/login",
            history,
          });
        } else {
          AntMessage.warn(intl.messages["landing.new_password.reset_error"]);
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

    const { intl } = this.props;

    const {
      password,
      passwordA,
      passwordPass,
      passwordAPass,
      passwordTip,
      passwordATip,
    } = this.state;

    return (
      <div className="new-email">
        <NavTop
          text={intl.messages["landing.new_password.title"]}
          show={"left"}
        />

        <div className="new-email-container">
          <div className="log-body_container--form">
            <div className="form_group">
              <span>
                <FormattedMessage id="landing.new_password.new_password" />
                {/* 新密码 */}
              </span>
              <input
                className={
                  passwordPass ? "form-input" : "form-input form-input_invalid"
                }
                type="password"
                placeholder={intl.messages["landing.new_password.set_password"]}
                value={password}
                onChange={(e) => this._validatePassword(e)}
                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                id="set-password"
              />
              <label htmlFor="set-password" className="brown">
                {passwordTip}
              </label>
            </div>
            <div className="form_group">
              <span>
                {/* 确认密码 */}
                <FormattedMessage id="landing.new_password.confirm_password" />
              </span>
              <input
                className={
                  passwordAPass ? "form-input" : "form-input form-input_invalid"
                }
                type="password"
                placeholder={
                  intl.messages["landing.new_password.double_password"]
                }
                value={passwordA}
                onChange={(e) => this._validatePasswordA(e)}
                pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                id="set-passwordA"
              />
              <label htmlFor="set-passwordA" className="brown">
                {passwordATip}
              </label>
            </div>
          </div>

          <div className="new-email-container__foot">
            <div className="new-email-container__foot-next">
              <a onClick={(e) => this.resetPasswordSubmit(e)} className="a-btn">
                <FormattedMessage id="landing.new_password.submit" />
                {/* 提交 */}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const NewPasswordWithRouter = withRouter(withApollo(injectIntl(NewPassword)));
delete NewPasswordWithRouter.contextType;
export default NewPasswordWithRouter;
