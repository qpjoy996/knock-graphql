import React from 'react';
import {withRouter, Link} from 'react-router-guard';
import {withApollo} from 'react-apollo';
import gql from 'graphql-tag';
import * as qs from 'query-string';

import {_historyHandler, importAll, _isTrueText, errorHandler} from "utils";
import AntMessage from 'components-lobby/partial/message/AntMessage';
import NavTop from "components-lobby/phone-partial/nav-top/NavTop";

import { PlatformContext } from "states/context/PlatformContext";

const SEND_PHONE_VERIFICATION = gql`
    mutation sendPhoneVerification($phone: String!) {
        sendVrfCodeMobileMsg(phone: $phone) {
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


class VerifyPhoneCode extends React.Component {

    static contextType = PlatformContext;

    state = {
        is_sending_sms: false,
        _count: 60,

        RESET_PHONE_CODE: '',
        RESET_PHONE_IS_SENDING: false,
        RESET_PHONE_COUNT: 60,
        RESET_VERIFY_CODE: '',


        phone: '',
        phoneCode: '',

        Page2VerifyObj: {
            timer: null,
            IS_SENDING_SMS: 'RESET_PHONE_IS_SENDING',
            COUNT_SMS: 'RESET_PHONE_COUNT',
            REGISTER_PHONE: 'RESET_SEND_PHONE',
            SMS_CODE: 'RESET_PHONE_CODE',
            account: ''
        },
    }

    constructor(props) {
        super(props);
    }

    async componentDidMount() {
        let {
            history
        } = this.props;
        const {
            Page2VerifyObj
        } = this.state;

        let phone;
        if (history && history.location && history.location.state) {
            phone = history.location.state.phone;
        } else {
            phone = ''
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
            phone
        });

        if (phone) {
            await this.getPhoneVerifyCode(phone);
        } else {
            AntMessage.warn('请输入手机号');
        }
    }

    setStateAsync(state) {
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
            USER_PHONE
        } = this.props;

        let is_sending_sms = localStorage.getItem(options.IS_SENDING_SMS);
        if (_isTrueText(is_sending_sms) === true) {
            AntMessage.warn('验证码已发送，请稍后再试！');
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

    sendPhoneCode = async (phone) => {
        const i18nMapping = this.context.i18nConfig.messages;
        return new Promise(async (resolve, reject) => {
            try {
                let dt = await this.props.client.mutate({
                    mutation: SEND_PHONE_VERIFICATION,
                    variables: {
                        phone
                    }
                });
                if (dt.data && dt.data.sendVrfCodeMobileMsg) {
                    if (dt.data.sendVrfCodeMobileMsg.code === 0) {
                        return resolve({
                            pass: true,
                            msg: i18nMapping['VERIFICATION_CODE_SENT']
                        })
                    } else {
                        return resolve({
                            pass: false,
                            msg: 'SMS not send'
                        })
                    }
                } else {
                    return resolve({
                        pass: false,
                        msg: 'phone error'
                    })
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
                    msg: error
                })
            }
        })
    }

    getPhoneVerifyCode = async (phone) => {

        const {
            Page2VerifyObj
        } = this.state;

        // const is_sending_sms = this.state[Page2VerifyObj.IS_SENDING_SMS];
        const is_sending_sms = localStorage.getItem(Page2VerifyObj.IS_SENDING_SMS);

        console.log(Page2VerifyObj, ' - - - -', is_sending_sms)

        console.log('isis shits', _isTrueText(is_sending_sms), is_sending_sms);
        if (_isTrueText(is_sending_sms)) {
            await this.sendSMSStatus(Object.assign(Page2VerifyObj, {account: phone}));
            return;
        } else {
            // await this.sendSMSStatus(Object.assign(Page2VerifyObj, {account: phone}));
            let phoneDT = await this.sendPhoneCode(phone);
            if (phoneDT.pass) {
                await this.sendSMSStatus(Object.assign(Page2VerifyObj, {account: phone}));
            } else {
                AntMessage.warn(phoneDT.msg);
            }
        }
    }


    checkVrfCode = async (target, code) => {
        const {
            client,
            history
        } = this.props;

        const {
            Page2VerifyObj
        } = this.state;

        const i18nMapping = this.context.i18nConfig.messages;

        let PHONE = this.state[Page2VerifyObj.phone];
        let SMS_CODE = this.state[Page2VerifyObj.SMS_CODE];

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
                    AntMessage.success('验证码验证成功！');

                    localStorage.setItem(PHONE, target);
                    localStorage.setItem(SMS_CODE, code);

                    _historyHandler({
                        jump: {
                            pathname: '/new-landing/reset-password',
                            state: {
                                phone: target,
                                vrfCode: code
                            }
                        },
                        history
                    })
                } else {
                    return AntMessage.error('验证码错误，请重新输入！');
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

    goVerifyPhoneCode = async () => {
        const {
            phone,
            phoneCode
        } = this.state;

        this.checkVrfCode(phone, phoneCode);
    }

    switchVerify = (e) => {
        const {
            history
        } = this.props;
        _historyHandler({
            jump: '/new-landing/get-email-code',
            history
        });
    }


    render() {
        const webpackContext = require.context('assets-lobby/img/landing', false, /\.(png|jpe?g|svg)$/);
        const images = importAll(webpackContext);

        const {
            phone,
            phoneCode,

            Page2VerifyObj
        } = this.state;

        let is_sending_sms = this.state[Page2VerifyObj.IS_SENDING_SMS];
        // let code = this.state[Page2VerifyObj.SMS_CODE];
        let count = this.state[Page2VerifyObj.COUNT_SMS];

        return (
            <div className="new-forget">
                <NavTop text={'忘记密码'} show={'left'}/>

                <div className="new-forget-container">
                    <div className="new-forget-container--inner">

                        <div className="form-inline">
                            <div className="text-white">
                                验证码将发送到手机，{phone}
                            </div>
                        </div>

                        <div className="text-grey">
                            如果长时间未收到验证码，请检查是否将运营商拉黑
                        </div>

                        <div className="text-white text-overline">
                            <span onClick={() => _historyHandler({
                                jump: {
                                    pathname: '/new-landing/reset-password',
                                    state: {
                                        phone: '123'
                                    }
                                },
                                history:this.props.history
                            })}>
                                验证码已发送至手机
                            </span>
                        </div>

                        <div className="form_group form-inline form-space-between">
                            <input className="form-input" value={phoneCode || ''}
                                   placeholder={'请填写验证码'}
                                   onChange={(e) => this.setState({
                                       phoneCode: e.target.value
                                   })}
                            />

                            {
                                is_sending_sms
                                    ?
                                    (
                                        <div className="settings__text un-active">
                                            {
                                                count
                                            }s 后可重新发送
                                        </div>
                                    ) :
                                    (
                                        <div className="settings__text"
                                             onClick={(e) => this.getPhoneVerifyCode(phone)}>
                                            重新发送验证码
                                        </div>
                                    )
                            }
                        </div>

                        <div className="brown-btn">
                            <a onClick={e => this.goVerifyPhoneCode(e)}
                               className="a-btn">下一步</a>
                        </div>

                        <div className="text-blue" onClick={(e) => this.switchVerify(e)}>
                            <a>
                                切换邮箱验证
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

const VerifyPhoneCodeWithRouter = withRouter(withApollo(VerifyPhoneCode));
delete VerifyPhoneCodeWithRouter.contextType;
export default VerifyPhoneCodeWithRouter;
