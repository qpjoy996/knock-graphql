import React from 'react';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-guard';
import { injectIntl, FormattedMessage } from "react-intl";
import { Menu, Dropdown, Button } from "antd";
import { CHECK_ACCOUNT, LOGIN_WITH_DEVICE, REGISTER_WITH_DEVICE } from "apollo/graphql/gql";
import { _historyHandler, _isInLocalStorage, setStateAsync } from "utils";
import { AUTH_TOKEN, DEVICE_ID, PLATFORM } from "utils/constants";
import { unityJSON, unityListen } from "utils/lib/unity";
import { PlatformContext } from "states/context/PlatformContext";
import BtnBasic from 'components/partial/button/BtnBasic'
import { LOGIN_MUTATION } from "../../../../apollo/graphql/gql";

import i18n from "i18n/index.js";
import { SERVER } from "states/APP_STATE";

console.log('land-device')

class LandDevice extends React.Component {

  state = {
    user: {
      token: "",
      userInfo: {},
      svrInfo: {}
    },
    account: '',
    password: '',
    loginLoading: false,
    deviceID: '',
    platform: '',
    landStatus: 'init'
  }

  static contextType = PlatformContext;

  async componentDidMount () {
    let platformContext = this.context;
    const that = this;

    let deviceID = platformContext.deviceID || _isInLocalStorage(DEVICE_ID);
    let platform = platformContext.platform || _isInLocalStorage(PLATFORM);
    await setStateAsync({
      platform,
    }, that);

    let autoLoginWithPWD = false;
    unityListen('accountPWDLogin', async function (account, password) {
      autoLoginWithPWD = true;

      if (account && password) {
        that.setState({
          account,
          password
        }, () => {
          that._landing();
        })
      }
    });


    window.isDeviceReady = function () {
      return {
        isDeviceReady: 'true'
      };
    }
    unityListen('deviceID', async function (deviceID, isAutoLogin) {
      let _deviceID = 'device:' + deviceID;
      console.log(_deviceID, 'else')
      that.checkAccountExist(_deviceID);
    });
  }

  checkAccountExist = async (deviceID) => {
    const { client } = this.props;

    localStorage.setItem(DEVICE_ID, deviceID);
    this.setState({ deviceID })

    const checkAccount = await client._query({
      query: CHECK_ACCOUNT,
      variables: {
        deviceID
      },
      fetchPolicy: 'network-only',
      // 设置这个数组后,await出来的就是 checkAccountRes.data.checkAccount
      // 并且该数组作为报错处理的非唯一依据(其余报错逻辑自行查阅_query函数),如果命中不了这个数组就会报错
      passCondition: ['data', 'checkAccount']
    })
    //只做成功的业务逻辑处理，报错在_query函数中统一处理
    if (checkAccount) {
      if (checkAccount.exist) {
        this.setState({ landStatus: 'start_game' })
      } else {
        this.setState({ landStatus: 'new_character' })
      }
    }

  }

  _landing = async () => {
    const { _updateState } = this.context;
    const {
      account,
      password,
    } = this.state;

    const {
      client
    } = this.props;

    const login = await client._mutate({
      mutation: LOGIN_MUTATION,
      variables: {
        account,
        password
      },
      fetchPolicy: 'no-cache',
      passCondition: ['data', 'login']
    });
    console.log(login, ' - - - - - - login mutate');

    if (!login) {
      return
    }

    let user = {
      token: login.token,
      userInfo: login.userInfo,
      svrInfo: login.svrInfo
    }

    let token = user.token;
    if (token) {
      localStorage.setItem(AUTH_TOKEN, token)
      _updateState({ token })
    }

    this.setState({
      user
    });
    this._landComplete(user);
  }

  _landComplete = (_user) => {

    const {
      deviceID,
      platform
    } = this.state;
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
        friendshipState
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
          __typename: 'userInfo'
        }
      }
    });

    let json = {
      account: deviceID,
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
      avatarJSON,
      hasAvatar
    }
    if (platform === 'playerhub') {
      if ((gender || gender === 0) && avatarJSON && nickname && nickname.indexOf('pid:') < 0) {
        let isAutoLogin = {
          autoLogin: true
        }
        unityJSON('setAutoLogin', isAutoLogin);
        unityJSON('userLogin', {
          ...json,
          ...avatar_json,
          'setAvatar': false
        });
        unityJSON('showFloatWeb', avatar_json);
        _historyHandler({
          jump: '/new-landing/set-nickname',
          history
        });
      } else {
        let isAutoLogin = {
          autoLogin: true
        }
        unityJSON('setAutoLogin', isAutoLogin);
        unityJSON('userLogin', {
          ...json,
          ...avatar_json,
          'setAvatar': true
        });
        // unityJSON('setAvatar', avatar_json);
        _historyHandler({
          jump: '/new-landing/set-nickname',
          history
        });
      }
    } else if (platform === 'editor') {
      // if (!avatarJSON) {
      //   unityJSON('setAvatar', avatar_json);
      // }
      let isAutoLogin = {
        autoLogin: true
      }
      unityJSON('setAutoLogin', isAutoLogin);
      unityJSON('userLogin', json);
    } else {
      _historyHandler({
        jump: '/new-landing/set-nickname',
        history
      })
    }
  }

  newCharacter = async (e) => {
    const {
      deviceID,
    } = this.state;
    const { client } = this.context;

    const token = await client._mutate({
      mutation: REGISTER_WITH_DEVICE,
      variables: {
        deviceID
      },
      passCondition: ['data', 'register', 'token']
    })
    if (token) {
      this.startGame()
    } else {
      this.setState({ landStatus: 'register_error' })
    }
    // let registerDT = await this.registerWithDeviceID(deviceID);
    // if (registerDT.pass) {
    //   let loginDT = await this.loginWithDeviceID(deviceID);
    //   if (loginDT.pass) {
    //     this._landComplete(loginDT.data);
    //   } else {
    //     this.setState({
    //       landStatus: 'land_error'
    //     })
    //     console.log(loginDT.msg, ' 2222 - - - ');
    //   }
    // } else {
    //   this.setState({
    //     landStatus: 'register_error'
    //   })
    // }
  }

  startGame = async (e) => {
    const {
      deviceID
    } = this.state;
    const { client, _updateState } = this.context;
    if (deviceID) {
      this.setState({ loginLoading: true })
      const loginRes = await client._mutate({
        mutation: LOGIN_WITH_DEVICE,
        variables: {
          account: deviceID
        },
        passCondition: ['data', 'login'],
        // pass code为操作成功的消息码
        passCode: "LOGIN_SUCCESS",
        errorCode: "LOGIN_FAILED"
      })
      this.setState({ loginLoading: false })
      if (loginRes) {
        const token = loginRes.token
        if (token) {
          localStorage.setItem(AUTH_TOKEN, token)
          _updateState({ token })
        }
        this._landComplete(loginRes)
      } else {
        this.setState({ landStatus: 'land_error' })
      }
    }

    // let loginDT = await this.loginWithDeviceID(deviceID);
    // if (loginDT.pass) {
    //   this._landComplete(loginDT.data);
    // } else {
    //   console.log(loginDT.msg);
    // }
  }

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
    const { intl } = this.props;
    const {
      landStatus,
      loginLoading
    } = this.state;
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
      <div className="landing-login">
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

        <p>
          <FormattedMessage id="new_landing.land.project" />
          <FormattedMessage id="new_landing.land.davinci" />
          {/* Project Da Vinci */}
        </p>
        <div className="landing-login-btn">
          {
            (landStatus === 'new_character') ? (
              <BtnBasic type="bottom" okText={intl.messages['new_landing.land.start_game']} loading={false} onClick={(e) => this.newCharacter(e)} />
            ) : (landStatus === 'start_game') ? (
              <BtnBasic type="bottom" okText={intl.messages['new_landing.land.start_game']} loading={loginLoading} onClick={(e) => this.startGame(e)} />
            ) : (
                  <BtnBasic type="bottom" okText={intl.messages['new_landing.land.account_not_ready']} disabled={true} />
                )
          }
        </div>
      </div>
    )
  }
}

const LandWithRouter = withRouter(withApollo(injectIntl(LandDevice)));
delete LandWithRouter.contextType;
export default LandWithRouter;
