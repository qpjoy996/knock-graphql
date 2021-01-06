import React, {Component} from 'react';
import {withApollo} from 'react-apollo';
import {withRouter} from 'react-router-guard';
import { injectIntl, FormattedMessage } from "react-intl";
import {importAll, _historyHandler, errorHandler, _isInLocalStorage} from "utils";
import {AUTH_TOKEN, ACCOUNT, MODE, PLATFORM} from "utils/constants";
import {validatePassword} from "utils/validatorHandler";
import {EMAIL_REGISTER_MUTATION} from '@gql'
import AntMessage from 'components-lobby/partial/message/AntMessage';

import {PlatformContext, PlatformConsumer} from "states/context/PlatformContext";

class SetPassword extends Component {
  static contextType = PlatformContext;

  constructor(props) {
    super(props);
    this.state = {
      pwA: '',
      pwB: '',
      pwAPass: true,
      pwBPass: true,
      pwATip: '',
      pwBTip: '',
      account: '',
      mode: ''
    }
  }

  componentDidMount() {
    // const {
    //     history
    // } = this.props;
    let platformContext = this.context;
    let platform = platformContext.platform || _isInLocalStorage(PLATFORM);
    localStorage.setItem('COUNT_EMAIL', '');

    const account = localStorage.getItem('REGISTER_EMAIL');
    this.setState({
      account,
      platform
    })
  }

  handlePw = (event, type) => {
    let val = event.target.value
    val = val.replace(/(^\s*)|(\s*$)/g, "");
    if (type === 'first') {
      this.setState({
        pwA: val,
        pwAPass: true
      })
      // this.checkPw(val, 'first')
    } else if (type === 'again') {
      this.setState({
        pwB: val,
        pwBPass: true
      })
    }
  }

  checkPwFormat = () => {
    const {intl} = this.props;
    const {pwA} = this.state
    const validObj = validatePassword(pwA);
    const i18nMapping = this.context.i18nConfig.messages;
    console.log('validObj', validObj)
    this.setState({
      pwA: pwA,
      pwAPass: validObj.valid,
      pwATip: intl.messages['tip.password'] 
    })
  };


  register = async (e, updateClient) => {
    const {
      pwA,
      pwB,
      pwAPass,
      pwBPass,
      platform
    } = this.state;


    let mode = 'EDITOR';
    if(platform === 'editor') {
      mode = 'EDITOR';
    }else if(platform === 'playerhub') {
      mode = 'HUB'
    }else {
      mode = 'WEB';
    }

    const {
      history,
      intl
    } = this.props;
    const account = localStorage.getItem('REGISTER_EMAIL');
    if (!account) {
      return AntMessage.error(intl.messages['landing.new_password.no_account']);
    }

    if (!pwA) {
      return this.setState({
        pwATip: intl.messages['landing.password.not_empty'],
        pwAPass: false
      });
    } else if (!pwB) {
      return this.setState({
        pwBTip: intl.messages['landing.password.not_empty'],
        pwBPass: false
      });
    } else if (pwA !== pwB) {
      return this.setState({
        pwBTip: intl.messages['landing.password.not_equal'],
        pwBPass: false
      })
    }
    const emailCode = localStorage.getItem('EMAIL_CODE');

    if (pwAPass && pwBPass) {
      try {
        let dt = await this.props.client.mutate({
          mutation: EMAIL_REGISTER_MUTATION,
          variables: {
            email: account,
            password: pwB,
            vrfCode: emailCode,
            mode
          }
        });
        let token = dt.data.register.token;
        if (token) {
          localStorage.setItem(AUTH_TOKEN, token);
          localStorage.setItem(ACCOUNT, account);
          AntMessage.success(intl.messages['landing.register_success']);
          history.push('/landing/set-nickname');
        }
      } catch (error) {
        if (error.graphQLErrors) {
          AntMessage.error(errorHandler({
            error,
            mapping: this.context.i18nConfig.messages
          }));
        }
      }
    }
  }

  render() {
    const webpackContext = require.context('assets-lobby/img/landing', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);

    const {intl} = this.props;
    const {
      pwA,
      pwB,
      pwAPass,
      pwBPass,
      pwATip,
      pwBTip
    } = this.state;
    return (
      <PlatformConsumer>
        {
          ({updateClient}) => {
            console.log('updateClient', updateClient)
            return (
              <div className="log">
                <div className="log-header">
                </div>
                <div className="log-body set-password">
                  <div className="log-body_container">
                    <div className="log-body_container--logo">
                      <img className="log-body_container--logo-img" alt={`logo`}
                           src={images['logo_u464.svg']}/>
                      <div className="log-body_container--logo_word">
                        <div className="log-body_container--logo_word-project">
                          {/* PROJECT */}
                          <FormattedMessage id="landing.login.project" />
                        </div>
                        <div className="log-body_container--logo_word-avatar">
                          {/* DaVinci */}
                          <FormattedMessage id="landing.login.davinci" />
                        </div>
                      </div>
                    </div>

                    <div className="log-body_container--form">
                      <div className="form_group">
                        <input
                          className={pwAPass ? 'form-input' : 'form-input form-input_invalid'}
                          type="password" placeholder={intl.messages['landing.new_password.set_password']}
                          value={pwA}
                          onChange={e => this.handlePw(e, 'first')}
                          onBlur={this.checkPwFormat}
                          pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                          id="set-password"
                        />
                        <label htmlFor="set-password">
                          {
                            pwATip
                          }
                        </label>
                      </div>
                      <div className="form_group">
                        <input
                          className={pwBPass ? 'form-input' : 'form-input form-input_invalid'}
                          type="password" placeholder={intl.messages['landing.new_password.double_password']}
                          value={pwB}
                          onChange={e => this.handlePw(e, 'again')}
                          id="set-passwordA"
                        />
                        <label htmlFor="set-passwordA">
                          {
                            pwBTip
                          }
                        </label>
                      </div>
                    </div>
                    <div className="log-body_container--footer">
                      <div className="footer--last_next">
                        <div className="footer--last"
                             onClick={(e) => _historyHandler({
                               step: 'last',
                               history: this.props.history
                             })}>
                          {/* 上一步 */}
                          <FormattedMessage id="landing.verify_email_code.pre" />
                        </div>

                        <div className="footer--next a-btn" onClick={(e) => this.register(e, updateClient)}>
                          {/*_historyHandler(e, {jump: '/landing/set-birthday', history})}>    */}
                          {/* 下一步 */}
                          <FormattedMessage id="landing.verify_email_code.next" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        }
      </PlatformConsumer>
    )
  }
}

const SetPasswordWithRouter = withRouter(withApollo(injectIntl(SetPassword)));
delete SetPasswordWithRouter.contextType;
export default SetPasswordWithRouter;
