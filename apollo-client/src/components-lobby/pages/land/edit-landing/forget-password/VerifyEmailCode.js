import React from 'react';
import { withRouter, Link } from 'react-router-guard';
import { withApollo } from 'react-apollo';
import { injectIntl, FormattedMessage } from "react-intl";
import gql from 'graphql-tag';
import * as qs from 'query-string';

import { _historyHandler, importAll, _isTrueText, errorHandler } from "utils";

import AntMessage from 'components-lobby/partial/message/AntMessage';
import NavTop from "components-lobby/phone-partial/nav-top/NavTop";

import { PlatformContext } from "states/context/PlatformContext";

const SEND_EMAIL_VERIFICATION = gql`
    mutation sendEmailVerification(
        $email: String!
    ){
        sendVrfCodeEmail(email: $email) {
            code
        }
    }
`;

const CHECK_CODE = gql`
    query checkVrfCode(
        $target: String!,
        $vrfCode: String!
    ){
        checkVrfCode(target: $target, vrfCode: $vrfCode)
    }
`;


class VerifyEmailCode extends React.Component {

  static contextType = PlatformContext;

  state = {
    is_sending_sms: false,
    _count: 60,

    RESET_EMAIL_IS_SENDING: false,
    RESET_SEND_EMAIL: '',
    RESET_EMAIL_COUNT: 60,
    RESET_EMAIL_CODE: '',

    email: '',
    emailCode: '',

    Page4VerifyEmailObj: {
      timer: null,
      IS_SENDING_SMS: 'RESET_EMAIL_IS_SENDING',
      COUNT_SMS: 'RESET_EMAIL_COUNT',
      REGISTER_PHONE: 'RESET_SEND_EMAIL',
      SMS_CODE: 'RESET_EMAIL_CODE',
      account: ''
    },
  }

  constructor(props) {
    super(props);
  }

  async componentDidMount () {
    let {
      history,
      intl
    } = this.props;
    const {
      Page2VerifyObj
    } = this.state;

    let email;
    if (history && history.location && history.location.state) {
      email = history.location.state.email;
    } else {
      email = ''
    }
    // if (!phone) {
    //     _historyHandler({
    //         jump: '/new-landing/get-phone-code',
    //         history
    //     });
    // }

    // let is_sending_sms = localStorage.getItem(Page2VerifyObj.IS_SENDING_SMS);
    // if (_isTrueText(is_sending_sms) === true) {
    //     await this.sendSMSStatus(Page2VerifyObj);
    //     // await this.pageHandler('2phoneVerify')
    // } else {
    //     // await this.pageHandler('1phoneTip')
    // }


    await this.setStateAsync({
      email
    });

    if (email) {
      // await this.getEmailVerifyCode(email);
    } else {
      AntMessage.warn(intl.messages['landing.verify_email_code.input_email']);
    }
  }

  setStateAsync (state) {
    return new Promise((resolve) => {
      this.setState(state, resolve)
    });
  }

  sendSMSStatus = async (options) => {
    // let newOptions = JSON.parse(JSON.stringify(options));
    let {
      IS_SENDING_SMS,
      COUNT_SMS,
      REGISTER_PHONE,
      SMS_CODE,
      account
    } = options;

    const {
      USER_PHONE,
      intl
    } = this.props;

    let is_sending_sms = localStorage.getItem(options.IS_SENDING_SMS);
    if (_isTrueText(is_sending_sms) === true) {
      AntMessage.warn(intl.messages['landing.verify_email_code.already_send']);
      // return;
      // console.log('is sending sms');
      // this.sendSMSStatus(_count, is_sending_sms, Page2VerifyObj);
    } else {
      is_sending_sms = true;
    }

    account = account || localStorage.getItem(options.REGISTER_PHONE);
    if (account === 'null') {
      account = '';
    } else if (!account) {
      account = USER_PHONE;
    }

    let sms_code;
    sms_code = localStorage.getItem(options.SMS_CODE);
    if (sms_code === 'null') {
      sms_code = '';
    } else if (!sms_code) {
      sms_code = ''
    }


    // if (phone || code) {
    //     await this.setStateAsync({
    //         [Page2VerifyObj.SMS_CODE]: code,
    //         [Page2VerifyObj.REGISTER_PHONE]: phone
    //     })
    // }

    let _count = localStorage.getItem(options.COUNT_SMS);
    if (_count === 'null' || !_count || parseInt(_count) < 0) {
      _count = 60;
    }


    await this.setStateAsync({
      [SMS_CODE]: sms_code,
      [REGISTER_PHONE]: account,
      [COUNT_SMS]: _count,
      [IS_SENDING_SMS]: is_sending_sms,
    });

    localStorage.setItem(IS_SENDING_SMS, is_sending_sms);
    localStorage.setItem(COUNT_SMS, _count);
    localStorage.setItem(REGISTER_PHONE, account);
    localStorage.setItem(SMS_CODE, sms_code);

    if (!options.timer) {
      options.timer = setInterval(() => {
        this.setState((prevState) => {
          const _count = prevState[COUNT_SMS] - 1;
          localStorage.setItem(COUNT_SMS, _count);
          return {
            [COUNT_SMS]: _count
          }
        }, () => {
          if (this.state[options.COUNT_SMS] === 0) {
            clearInterval(options.timer);
            localStorage.setItem(COUNT_SMS, 60);
            localStorage.setItem(IS_SENDING_SMS, false);
            this.setState({
              [COUNT_SMS]: 60,
              [IS_SENDING_SMS]: false
            })
          }
        })
      }, 1000);
    } else {
      clearInterval(options.timer);

      options.timer = setInterval(() => {
        this.setState((prevState) => {
          const _count = prevState[COUNT_SMS] - 1;
          localStorage.setItem(COUNT_SMS, _count);
          return {
            [COUNT_SMS]: _count
          }
        }, () => {
          if (this.state[options.COUNT_SMS] === 0) {
            clearInterval(options.timer);
            localStorage.setItem(COUNT_SMS, 60);
            localStorage.setItem(IS_SENDING_SMS, false);
            this.setState({
              [COUNT_SMS]: 60,
              [IS_SENDING_SMS]: false
            })
          }
        })
      }, 1000);
    }
  }

  sendEmailCode = async (email) => {
    const i18nMapping = this.context.i18nConfig.messages;
    return new Promise(async (resolve, reject) => {
      try {
        let dt = await this.props.client.mutate({
          mutation: SEND_EMAIL_VERIFICATION,
          variables: {
            email
          }
        });

        if (dt.data && dt.data.sendVrfCodeEmail) {
          if (dt.data.sendVrfCodeEmail.code === 0) {
            return resolve({
              pass: true,
              msg: i18nMapping['VERIFICATION_CODE_SENT']
            })
          } else {
            return resolve({
              pass: false,
              msg: i18nMapping['landing.verify_email_code.email_not_send']
            })
          }
        }
      } catch (error) {
        console.log(error);
        if (error.graphQLErrors) {
          error.graphQLErrors.map((err) => {
            if (err.extensions && err.extensions.errcode) {
              AntMessage.error(errorHandler({
                error,
                mapping: i18nMapping
              }));
            }
          })
        }
        return reject({
          pass: false,
          msg: i18nMapping['landing.verify_email_code.reject']
        })
      }
    });
  }

  getEmailVerifyCode = async (email) => {

    const {
      Page4VerifyEmailObj
    } = this.state;

    // const is_sending_sms = this.state[Page2VerifyObj.IS_SENDING_SMS];
    const is_sending_sms = localStorage.getItem(Page4VerifyEmailObj.IS_SENDING_SMS);

    console.log('isis shits', _isTrueText(is_sending_sms), is_sending_sms);
    if (_isTrueText(is_sending_sms)) {
      await this.sendSMSStatus(Object.assign(Page4VerifyEmailObj, { account: email }));
      return;
    } else {
      // await this.sendSMSStatus(Object.assign(Page4VerifyEmailObj, {account: email}));
      let phoneDT = await this.sendEmailCode(email);
      if (phoneDT.pass) {
        await this.sendSMSStatus(Object.assign(Page4VerifyEmailObj, { account: email }));
      } else {
        AntMessage.warn(phoneDT.msg);
      }
    }
  }


  checkVrfCode = async (target, code) => {
    const i18nMapping = this.context.i18nConfig.messages;
    const {
      client,
      history
    } = this.props;

    const {
      Page4VerifyEmailObj
    } = this.state;

    // let PHONE = this.state[Page4VerifyEmailObj.phone];
    // let SMS_CODE = this.state[Page2VerifyObj.SMS_CODE];

    try {
      let dt = await client.query({
        query: CHECK_CODE,
        variables: {
          target,
          vrfCode: code
        }
      });

      if (dt.data) {
        if (dt.data.checkVrfCode === true) {
          AntMessage.success(i18nMapping['landing.verify_email_code.code_success']);

          // localStorage.setItem(PHONE, target);
          // localStorage.setItem(SMS_CODE, code);

          _historyHandler({
            jump: {
              pathname: '/landing/reset-password',
              state: {
                email: target,
                vrfCode: code
              }
            },
            history
          })
        } else {
          return AntMessage.error(i18nMapping['landing.verify_email_code.code_error']);
        }
      }
    } catch (error) {
      if (error.graphQLErrors) {
        error.graphQLErrors.map((err) => {
          if (err.extensions && err.extensions.errcode) {
            AntMessage.error(errorHandler({
              error,
              mapping: i18nMapping
            }));
          }
        })
      }
    }
  }

  goVerifyEmailCode = async () => {
    const {
      email,
      emailCode
    } = this.state;

    this.checkVrfCode(email, emailCode);
  }

  switchVerify = (e) => {
    const {
      history
    } = this.props;
    _historyHandler({
      jump: '/landing/get-phone-code',
      history
    });
  }


  render () {
    const webpackContext = require.context('assets-lobby/img/landing', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);

    const {intl} = this.props;
    const {
      email,
      emailCode,

      Page4VerifyEmailObj
    } = this.state;

    let is_sending_sms = this.state[Page4VerifyEmailObj.IS_SENDING_SMS];
    // let code = this.state[Page2VerifyObj.SMS_CODE];
    let count = this.state[Page4VerifyEmailObj.COUNT_SMS];

    return (
      <div className="new-forget">
        <NavTop text={intl.messages['landing.get_email_code.title']} show={"left"} />

        <div className="new-forget-container">
          <div className="new-forget-container--inner">

            <div className="form-inline">
              <div className="text-white text-size-16">
                <FormattedMessage id="landing.verify_email_code.verify_send" /> {email}
              </div>
            </div>

            <div className="text-grey">
              {/* 如果长时间未收到验证码，请检查是否将运营商拉黑 */}
              <FormattedMessage id="landing.get_email_code.tip" />
            </div>

            <div className="text-white text-overline text-size-16">
              <span>
                <FormattedMessage id="landing.verify_email_code.already_send" />
              </span>
            </div>

            <div className="form_group form-inline form-space-between">
              <input className="form-input" value={emailCode || ''}
                placeholder={intl.messages['landing.verify_email_code.input_code']}
                onChange={(e) => this.setState({
                  emailCode: e.target.value
                })}
              />

              {
                is_sending_sms
                  ?
                  (
                    <div className="settings__text un-active">
                      {
                        count
                      }
                      {/* s 后可重新发送 */}
                      <FormattedMessage id="landing.verify_email_code.resend_available" />
                                        </div>
                  ) :
                  (
                    <div className="settings__text"
                      onClick={(e) => this.getEmailVerifyCode(email)}>
                      {/* 重新发送验证码 */}
                      <FormattedMessage id="landing.verify_email_code.resend" />
                                        </div>
                  )
              }
            </div>

            <div className="brown-btn">
              <a onClick={e => this.goVerifyEmailCode(e)}
                className="a-btn" href>
                  <FormattedMessage id="landing.verify_email_code.next" />
                  {/* 下一步 */}
                  </a>
            </div>

            {/* <div className="text-blue"
              style={{
                color: 'grey',
                pointerEvents: 'none'
              }}
              onClick={(e) => this.switchVerify(e)}>
              <a className="text-size-16" style={{
                // color: 'grey',
                pointerEvents: 'none'
              }} href>切换手机验证</a>
            </div> */}
          </div>
        </div>
      </div>
    )
  }
}

const VerifyEmailCodeWithRouter = withRouter(withApollo(injectIntl(VerifyEmailCode)));
delete VerifyEmailCodeWithRouter.contextType;
export default VerifyEmailCodeWithRouter;
