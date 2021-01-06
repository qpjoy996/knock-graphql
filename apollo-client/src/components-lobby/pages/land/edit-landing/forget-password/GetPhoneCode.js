import React from 'react';
import {_historyHandler, importAll} from "utils";
import {withRouter, Link} from 'react-router-guard';
import {withApollo} from 'react-apollo';
import gql from 'graphql-tag';
import * as qs from 'query-string';

import {validatePhone} from "utils/validatorHandler";

import AntMessage from 'components-lobby/partial/message/AntMessage';

import NavTop from "components-lobby/phone-partial/nav-top/NavTop";

import { PlatformContext } from "states/context/PlatformContext";

const CHECK_ACCOUNT = gql`
    query CheckAccount(
        $phone: String!
    ){
        checkAccount(phone: $phone){
            exist
        }
    }
`;

class GetPhoneCode extends React.Component {

    static contextType = PlatformContext;

    state = {
        phone: ''
    }

    constructor(props) {
        super(props);
    }

    async componentDidMount() {

    }

    setStateAsync(state) {
        return new Promise((resolve) => {
            this.setState(state, resolve)
        });
    }

    phoneCheck = async (phone) => {
        let i18nMapping = this.context.i18nConfig && this.context.i18nConfig.messages;
        console.log(i18nMapping, ' - - - - - - this is i18n mapping!!!!');
        return new Promise(async (resolve, reject) => {
            if (!phone) {
                return resolve({
                    pass: false,
                    msg: i18nMapping['PHONE_REQUIRED']
                });
            }
            const phoneValidator = validatePhone(phone);

            if (!phoneValidator.valid) {
                return resolve({
                    pass: false,
                    msg: i18nMapping['PHONE_INVALID']
                });
            }

            try {
                let dt = await this.props.client.query({
                    query: CHECK_ACCOUNT,
                    variables: {
                        phone
                    }
                });

                if (dt.data && dt.data.checkAccount) {
                    let exist = dt.data.checkAccount.exist;
                    if (exist) {
                        return resolve({
                            pass: true,
                            msg: i18nMapping['PHONE_VALID']
                        })
                    } else {
                        return resolve({
                            pass: false,
                            msg: i18nMapping['PHONE_NOT_EXIST']
                        });
                    }
                } else {
                    return resolve({
                        pass: false,
                        msg: 'something wrong!'
                    })
                }
            } catch (error) {        
                console.log(error);       
                return reject({
                    pass: false,
                    msg: i18nMapping['PHONE_ERROR']
                })
            }
        })
    };

    goGetPhoneCode = async () => {
        const {
            phone
        } = this.state;
        const {
            history
        } = this.props;

        let dt = await this.phoneCheck(phone);
        if (dt.pass) {
            _historyHandler({
                jump: {
                    pathname: '/new-landing/verify-phone-code',
                    state: {
                        phone
                    }
                },
                history
            });
        } else {
            AntMessage.warn(dt.msg);
        }
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
            phone
        } = this.state;

        return (
            <div className="new-forget">
                <NavTop text={'忘记密码'} show={'left'}/>

                <div className="new-forget-container">
                    <div className="new-forget-container--inner">

                        <div className="">
                            <div className="text-white">
                                验证码将发送到手机，
                            </div>

                            <input className="form-input" type="text"
                                   placeholder="请输入手机号"
                                // placeholder="请输入邮箱"
                                   value={phone}
                                   onChange={e => this.setState({
                                       phone: e.target.value
                                   })}
                                   id="phone"
                                   required
                            />
                        </div>

                        <div className="text-grey">
                            如果长时间未收到验证码，请检查是否将运营商拉黑
                        </div>

                        <div className="brown-btn">
                            <a onClick={e => this.goGetPhoneCode(e)}
                               className="a-btn">获取验证码</a>
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

const GetPhoneCodeWithRouter = withRouter(withApollo(GetPhoneCode));
delete GetPhoneCodeWithRouter.contextType;
export default GetPhoneCodeWithRouter;