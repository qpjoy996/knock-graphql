import React from "react";
import { withApollo } from "react-apollo";
import { withRouter } from "react-router-guard";
import { PlatformContext } from "states/context/PlatformContext";
import { LILITH_LOGIN } from "apollo/graphql/gql";
import { _historyHandler, _isInLocalStorage, setStateAsync } from "utils";
import {
  AUTH_TOKEN,
  PLATFORM,
  LILITH_TOKEN,
  PHONE_INFO,
} from "utils/constants";
import { unityJSON, unityListen } from "utils/lib/unity";

import { message } from "antd";
// import GlobalMessage from "components/partial/message/GlobalMessage";

message.config({
  maxCount: 7,
});

class LandLilith extends React.Component {
  state = {
    user: {
      token: "",
      userInfo: {},
      svrInfo: {},
    },
    lilithToken: "",
    lilithLoginObj: null,
    platform: "",
    landStatus: "init",
    firstTime: true,
  };

  static contextType = PlatformContext;

  async componentDidMount() {
    let platformContext = this.context;

    const that = this;

    let platform = platformContext.platform || _isInLocalStorage(PLATFORM);

    window.isDeviceReady = function () {
      return {
        isDeviceReady: "true",
      };
    };

    await setStateAsync(
      {
        platform,
      },
      that
    );

    // const _lilithLoginObj = {
    //   appid: '',
    //   appuid: '',
    //   apptoken: '',
    //   model: '',
    //   s_v: '',
    //   device: '',
    //   app_v: '',
    //   aid: '',
    // }

    unityListen("lilithToken", function (_lilithLoginObj) {
      let lilithLoginObj = JSON.parse(_lilithLoginObj);
      console.log(lilithLoginObj, _lilithLoginObj, ' - - - - -- lilith login obj')
      that.setState({
        landStatus: "loading",
        lilithLoginObj,
      });
      if (lilithLoginObj) {
        let phoneInfo = {
          model: lilithLoginObj.model,
          s_v: lilithLoginObj.s_v,
          device: lilithLoginObj.device,
          app_v: lilithLoginObj.app_v,
          aid: lilithLoginObj.aid,
        };
        platformContext._updateState({
          phoneInfo,
        });
        localStorage.setItem(PHONE_INFO, JSON.stringify(phoneInfo));
        // ensure phone info set to localStorage
        setTimeout(() => {
          that.landLilith(lilithLoginObj);
        }, 300);
      }
    });
  }

  landLilith = async ({ appid, appuid, apptoken }) => {
    const { client } = this.context;
    localStorage.setItem(LILITH_TOKEN, apptoken);
    this.setState({ lilithToken: apptoken });

    console.log(  appid,
      appuid,
      apptoken, ' - - -- - login by lilith sdk');
    const user = await client._mutate({
      mutation: LILITH_LOGIN,
      variables: {
        appid: appid + '',
        appuid: appuid + '',
        apptoken,
        mode: "HUB",
      },
      passCondition: ["data", "loginByLilithSDK"],
      passCode: "LOGIN_SUCCESS",
      errorCode: "LOGIN_FAILED",
    });

    console.log(user, " - - this is user in landing LILITH");
    if (user) {
      const {
        userInfo: { nickname, gender, avatarJSON },
        token,
      } = user;

      // gender 未定义：0 男生：1 女生：2
      if (token) {
        localStorage.setItem(AUTH_TOKEN, token);
      }
      this.setState({
        landStatus: "start_game",
        user,
      });
      this._landComplete(user);
    } else {
      console.log("google token else...", user);
      this.setState({
        landStatus: "account_error",
      });
      this.setLandLogin.addEventListener("touchstart", this.googleAuth, false);
    }
  };

  _landComplete = (_user) => {
    const { platform, firstTime } = this.state;
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
        friendshipState,
      },
      token,
      firstLogin,
      svrInfo,
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
          __typename: "userInfo",
        },
      },
    });

    let json = {
      account: nickname,
      userId: userID,
      numberID,
      name: nickname,
      token,
      gender,
      avatarJSON,
      timestamp: svrInfo.unixTimestamp + "",
      imEnvID: svrInfo.imEnvID
    };

    let avatar_json = {
      avatarJSON,
      hasAvatar,
    };

    if (platform === "playerhub") {
      if (
        (gender || gender === 0) &&
        avatarJSON &&
        nickname &&
        nickname.indexOf("pid:") < 0
      ) {
        let isAutoLogin = {
          autoLogin: true,
        };
        unityJSON("setAutoLogin", isAutoLogin);
        unityJSON("userLogin", {
          ...json,
          ...avatar_json,
          setAvatar: false,
        });
        unityJSON("showFloatWeb", avatar_json);
        _historyHandler({
          jump: "/new-landing/set-nickname",
          history,
        });
      } else {
        let isAutoLogin = {
          autoLogin: true,
        };
        unityJSON("setAutoLogin", isAutoLogin);
        unityJSON("userLogin", {
          ...json,
          ...avatar_json,
          setAvatar: true,
        });
        // unityJSON('setAvatar', avatar_json);
        _historyHandler({
          jump: "/new-landing/set-nickname",
          history,
        });
      }
    } else if (platform === "editor") {
      // if (!avatarJSON) {
      //   unityJSON('setAvatar', avatar_json);
      // }
      let isAutoLogin = {
        autoLogin: true,
      };
      unityJSON("setAutoLogin", isAutoLogin);
      unityJSON("userLogin", json);
    } else {
      _historyHandler({
        jump: "/new-landing/set-nickname",
        history,
      });
    }
  };

  // lilithAuth = async (e) => {
  //   if (this.state.landStatus === "account_error") {
  //     this.setState({ landStatus: "init" });
  //   }
  //   unityJSON("lilithAuth", {
  //     force: true,
  //   });
  // };

  render() {
    const { landStatus } = this.state;
    return (
      <div className="landing-login" ref={(el) => (this.setLandLogin = el)}>
        <p>Project Da Vinci</p>
        <div className="landing-login-btn ant-btn-parent">
          {landStatus === "start_game" || landStatus === "loading" ? (
            <span>Loading...</span>
          ) : landStatus === "account_error" ? (
            <span>touch to start</span>
          ) : null}
        </div>
      </div>
    );
  }
}

const LandLilithWithRouter = withRouter(withApollo(LandLilith));
delete LandLilithWithRouter.contextType;
export default LandLilithWithRouter;
