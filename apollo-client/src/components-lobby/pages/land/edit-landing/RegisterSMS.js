import React, {Component} from 'react';
import {withApollo} from 'react-apollo';
import {Checkbox, Menu, Dropdown, Icon, Button} from 'antd';
import {Link, withRouter} from 'react-router-guard';
import {findIndex, debounce} from 'lodash';

// import {REGISTER_PHONE, IS_SENDING_SMS, COUNT_SMS, SMS_CODE} from "utils/config";
import {importAll, _historyHandler} from "utils";
// import errorHandler from "utils/errorHandler";
// import {validatePhone} from "utils/validatorHandler";
// import {_isTrueText, _isNil} from "utils/_types";

// import AntMessage from 'components/partial/message/AntMessage';
// import {PHONE_CODE} from "../../../utils/config";


class RegisterSMS extends Component {
    constructor(props) {
        super(props);
        this.state = {
            areaIndex: 0,
            _count: 60,
            register_phone: '',
            phoneTip: '',
            phoneValid: true,
            sms_code: '',
            is_sending_sms: false,
            areas: [
                {
                    id: 1,
                    name: '中国大陆',
                    code: '+86'
                },
                {
                    id: 2,
                    name: '中国香港',
                    code: '+87'
                },
                {
                    id: 3,
                    name: '中国台湾',
                    code: '+89'
                }
            ]
        }
    }

    render() {
        const webpackContext = require.context('assets-lobby/img/landing', false, /\.(png|jpe?g|svg)$/);
        const images = importAll(webpackContext);

        const {
            areas,
            areaIndex,
            _count,
            register_phone,
            phoneValid,
            phoneTip,
            sms
        } = this.state;

        const {
            // id,
            name,
            code
        } = areas[areaIndex];

        const menu = (
            <Menu className="area-dropdown" onClick={(e) => this.handleMenuClick(e)}>
                {
                    areas && areas.map((item) => {
                        return (
                            <Menu.Item key={item.id}>
                                {item.name}
                            </Menu.Item>
                        )
                    })
                }
            </Menu>
        );


        return (
            <div className="log">
                <div className="log-header">
                    {/*<div className="log-header__operator">*/}
                    {/*    <img className="log-header__operator-min"*/}
                    {/*         alt={`缩小`}*/}
                    {/*         src={images[`operator_min_u21.png`]}*/}
                    {/*    />*/}
                    {/*</div>*/}
                    {/*<div className="log-header__operator">*/}
                    {/*    <img className="log-header__operator-x"*/}
                    {/*         alt={`关闭`}*/}
                    {/*         src={images[`operator_x_u20.png`]}*/}
                    {/*    />*/}
                    {/*</div>*/}
                </div>

                <div className="log-body register-sms">
                    <div className="log-body_container">
                        <div className="log-body_container--logo">
                            <img className="log-body_container--logo-img" alt={`logo`} src={images['logo_u464.svg']}/>
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
                                <Dropdown className="choose-area" overlay={menu}>

                                    <Button>
                                        {
                                            name
                                        }
                                        <img
                                            className="more-area"
                                            src={images['triangle_down_u56.svg']}
                                            alt={`more`}
                                        />
                                    </Button>
                                </Dropdown>
                            </div>
                            <div className="form_group">
                                <div className="form-input--s">
                                    {
                                        code
                                    }
                                </div>
                                <input
                                    className={phoneValid ? "form-input form-input--m" : "form-input form-input--m form-input_invalid"}
                                    type="text"
                                    placeholder="请输入手机号"
                                    value={register_phone || ''}
                                    onChange={e => this._phoneValidate(e)}
                                    id="register_phone"
                                />
                                <label htmlFor="register_phone">
                                    {
                                        phoneTip
                                    }
                                </label>
                            </div>
                            <div className="form_group">
                                <input className="form-input area-sms"
                                       type="text"
                                       placeholder="请输入短信验证码"
                                       value={sms}
                                       onChange={e => this.setState({
                                           sms_code: e.target.value
                                       })}
                                />

                                <a className="a-btn get-area-sms" style={this.state.is_sending_sms ? {
                                    backgroundColor: '#FFF',
                                    color: '#999',
                                    pointerEvents: 'none'
                                } : {}} onClick={(e) => this.sendSMS(60, true)}>
                                    {this.state.is_sending_sms ? (
                                        <>
                                            重新获取{_count}...
                                        </>
                                    ) : '获取短信验证码'}
                                </a>
                            </div>

                            <div className="form_text">
                                <Link to={'/landing/email'}>使用邮箱注册</Link>
                            </div>
                        </div>
                        <div className="log-body_container--footer">
                            <div className="footer--last_next">
                                <div className="footer--last"
                                     onClick={(e) => _historyHandler({step: 'last', history: this.props.history})}>
                                    上一步
                                </div>

                                <div className="footer--next a-btn"
                                     onClick={(e) => this.registerSMSNext()}>
                                    {/*onClick={(e) => _historyHandler({jump: "/landing/set-password", history})}>*/}

                                    {/*{*/}
                                    {/*     jump: "/landing/set-password",*/}
                                    {/*     history: this.props.history*/}
                                    {/* }*/}
                                    下一步
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )

    }
}

export default withRouter(withApollo(RegisterSMS));
