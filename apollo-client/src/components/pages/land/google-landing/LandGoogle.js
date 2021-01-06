import React from 'react';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-guard';
import { injectIntl, FormattedMessage } from "react-intl";
import { PlatformContext } from "states/context/PlatformContext";
import { GOOGLE_LOGIN, TRACK_CLIENT } from "apollo/graphql/gql";
import { _historyHandler, _isInLocalStorage, setStateAsync } from "utils";
import { AUTH_TOKEN, PLATFORM, GOOGLE_TOKEN, PHONE_INFO } from "utils/constants";
import { unityJSON, unityListen } from "utils/lib/unity";

import { message } from 'antd';
import GlobalMessage from "components/partial/message/GlobalMessage";

message.config({
  maxCount: 7
})

class LandGoogle extends React.Component {

  state = {
    user: {
      token: "",
      userInfo: {},
      svrInfo: {}
    },
    googleToken: '',
    googleAuthObj: null,
    platform: '',
    landStatus: 'init',
    authTime: 0,
    firstTime: true
  }

  static contextType = PlatformContext;

  async componentDidMount () {
    let platformContext = this.context;
    let { client } = this.props;

    const that = this;

    let platform = platformContext.platform || _isInLocalStorage(PLATFORM);

    window.isDeviceReady = function () {
      return {
        isDeviceReady: 'true'
      };
    }

    await setStateAsync({
      platform,
    }, that);

    unityListen('googleToken', function (_googleAuthObj) {
      let googleAuthObj = JSON.parse(_googleAuthObj);
      that.setState({
        landStatus: 'loading',
        googleAuthObj
      });
      if (googleAuthObj) {
        let googleError = googleAuthObj.error;
        console.log(googleAuthObj, ' - - - this is googleAuthObj');

        if (googleError && [-1].indexOf(googleError) < 0) {
          // https://developers.google.com/android/reference/com/google/android/gms/common/api/CommonStatusCodes.html#ERROR
          let errMsg = '';
          if ([17, 16].indexOf(googleError) >= 0) {
            errMsg = 'Google not connected.'
          } else if ([8].indexOf(googleError) >= 0) {
            errMsg = 'Google service internal error, please retry.'
          } else if ([7].indexOf(googleError) >= 0) {
            errMsg = 'Network error, please retry.'
          } else if ([2].indexOf(googleError) >= 0) {
            errMsg = 'Your google service is out of date, please update.'
          } else if ([15].indexOf(googleError) >= 0) {
            errMsg = 'Connect to google timeout, please verify your network and retry.'
          } else {
            errMsg = 'Google service error.'
          }
          message.info(
            <GlobalMessage
              type={'error'}
              description={errMsg}
            />);
          that.setState({
            landStatus: 'account_error'
          });
          that.setLandLogin.addEventListener("touchstart", that.googleAuth, false);
          return;
        }

        let phoneInfo = {
          model: googleAuthObj.model,
          s_v: googleAuthObj.s_v,
          device: googleAuthObj.device,
          app_v: googleAuthObj.app_v,
          aid: googleAuthObj.aid
        };
        platformContext._updateState({
          phoneInfo
        });
        localStorage.setItem(PHONE_INFO, JSON.stringify(phoneInfo));

        // ensure phone info set to localStorage
        setTimeout(() => {
          that.landGoogle({
            googleToken: googleAuthObj.token
          })
        }, 300)
      }
    });
  }

  landGoogle = async ({ googleToken }) => {
    const { client } = this.context
    let { authTime } = this.state
    localStorage.setItem(GOOGLE_TOKEN, googleToken);
    this.setState({ googleToken })
    const user = await client._mutate({
      mutation: GOOGLE_LOGIN,
      variables: {
        gpToken: googleToken
      },
      passCondition: ['data', 'loginByGooglePlay'],
      passCode: "LOGIN_SUCCESS",
      errorCode: "LOGIN_FAILED"
    })

    console.log(user, ' - - this is user in landing Google');
    if (user) {
      const {
        userInfo: {
          nickname,
          gender,
          avatarJSON,
        },
        token,
      } = user

      // gender 未定义：0 男生：1 女生：2
      if (token) {
        localStorage.setItem(AUTH_TOKEN, token);
      }
      this.setState({
        landStatus: 'start_game',
        user
      })
      this._landComplete(user);
    } else {
      console.log('google token else...', user);
      if (authTime <= 3) {
        unityJSON('googleAuth', {
          expired: true
        });

        authTime = authTime + 1;
        await setStateAsync({
          authTime
        }, this);
      }
      this.setState({
        landStatus: 'account_error'
      });
      this.setLandLogin.addEventListener("touchstart", this.googleAuth, false);
    }
  }

  _landComplete = (_user) => {
    const {
      platform,
      firstTime
    } = this.state;
    const { history, client } = this.props;

    let user = _user ? _user : this.state.user;

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
      firstLogin,
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

    client.mutate({
      mutation: TRACK_CLIENT,
      variables: {
        input: {
          trackKey: "webGooleLand"
        }
      }
    }).then((dt) => {
      console.log(`[Davinci info]:`, dt);
    }).catch((e) => {
      console.log(`[Davinci info]:`, e)
    })

    let json = {
      account: nickname,
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

  googleAuth = async (e) => {
    if (this.state.landStatus === 'account_error') {
      this.setState({ landStatus: 'init' })
    }
    const { googleAuthObj } = this.state;
    unityJSON('googleAuth', {
      force: true
    });
  }

  render () {
    const {
      landStatus
    } = this.state;
    return (
      <div className="landing-login" ref={el => this.setLandLogin = el}>
        <p>
          <FormattedMessage id="new_landing.land.project" />
          <FormattedMessage id="new_landing.land.davinci" />
        </p>
        <div className="landing-login-btn ant-btn-parent">
          {
            (landStatus === 'start_game' || landStatus === 'loading') ? (
              <span>Loading...</span>
            ) : (landStatus === 'account_error') ? (
              <span>touch to start</span>
            ) : null
          }
        </div>
      </div>
    )
  }
}

const LandGoogleWithRouter = withRouter(withApollo(injectIntl(LandGoogle)));
delete LandGoogleWithRouter.contextType;
export default LandGoogleWithRouter;

