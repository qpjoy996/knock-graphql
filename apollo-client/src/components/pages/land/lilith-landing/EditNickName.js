import React from 'react';
import { withApollo } from 'react-apollo';
import { withRouter } from 'react-router-guard';
import { isEqual } from 'lodash';
import { Input, message, Drawer } from 'antd';
import { injectIntl, FormattedMessage } from "react-intl";
import { importAll, _historyHandler, charCodeLen } from "utils";
import { unityJSON, unityListen } from "utils/lib/unity";
import { PlatformContext } from "states/context/PlatformContext";
import { QUERY_MYSELF, SET_NICKNAME } from "apollo/graphql/gql";
import GlobalMessage from 'components/partial/message/GlobalMessage';
import BtnBack from 'components/partial/button/BtnBack'
import BtnBasic from 'components/partial/button/BtnBasic'
import PrivacyPalicy from 'components/partial/privacy/PrivacyPalicy'
import Terms from 'components/partial/privacy/Terms'
import ImgLoade from 'components/partial/load/ImgLoad';

import wordFilter from 'utils/sensitive/wordFilter';

let fakerator = require('fakerator')();

message.config({
  maxCount: 7
})

class EditNickName extends React.Component {

  static contextType = PlatformContext;

  static getDerivedStateFromProps (nextProps, prevState) {
    if (nextProps.userInfo && !(isEqual(prevState.userInfo, nextProps.userInfo))) {
      let nickname = nextProps.userInfo.nickname;
      if (nickname.indexOf('pid:') >= 0) {
        nickname = ''
      }
      console.log(nextProps.userInfo, ' - - -this is userInfo', prevState.userInfo);
      return {
        userInfo: nextProps.userInfo,
        nickname
      }
    } else {
      return null
    }
  }

  state = {
    nickname: '',
    userInfo: null,
    visible: false,
    privacyTitle: '',
    loadedImg: null,
    gender: 1,
    avatarJSON: '',
    isInputBlur: true
  }

  constructor(props) {
    super(props);
  }

  async componentDidMount () {
    const that = this;
    unityListen('refreshProfile', async function () {
      await that.refreshProfile();
    });
    await this.refreshProfile();

    this.nickNameRef.addEventListener('touchstart', function () {
      that._refreshInput();
    }, false)
  }

  _refreshInput = () => {
    this.setState({ isInputBlur: false }, () => {
      this.setState({ isInputBlur: true })
    })
  }

  privacyClose = () => {
    this.setState({
      visible: false
    })
    this.drawerContent.parentNode.parentNode.style.animation = "none";
  }
  privacyVisible = (str) => {
    this.setState({
      visible: true,
      privacyTitle: str
    })
    this.termsRefs.addEventListener('click', this.onChPangePrivacy, true);
    this.privacyRefs.addEventListener('click', this.onChPangePrivacy, true);
  }

  onChPangePrivacy = () => {
    this.drawerContent.parentNode.parentNode.style.animation = "privacyAnimation .5s linear";
  }

  // refreshProfile = async () => {
  //   const {
  //     client
  //   } = this.props;
  //   const userInfo = await client._query({
  //     query: QUERY_MYSELF,
  //     fetchPolicy: "network-only",
  //     passCondition: ['data', 'queryMyself', 'userInfo'],
  //     errorCode: 'GET_USER_FAILED',
  //     pollInterval: 1000,
  //   })
  //   if (userInfo) {
  //     this.setState({
  //       userInfo
  //     })
  //     localStorage.setItem('USER_ID', userInfo.userID)
  //     localStorage.setItem('USER_AVATAR', userInfo.iconURL)
  //     if (userInfo && userInfo.avatarJSON) {
  //       this.setState({
  //         gender: JSON.parse(userInfo.avatarJSON).suitsDatas[0].gender,
  //         avatarJSON: userInfo.avatarJSON
  //       })
  //     }
  //     client.writeData({
  //       data: {
  //         userInfo: {
  //           iconURL: userInfo.iconURL,
  //           avatarBodyURL: userInfo.avatarBodyURL,
  //           __typename: 'userInfo'
  //         }
  //       }
  //     });
  //   }
  // }

  saveUserInfo = (userInfo, that) => {
    const {client} = that.props;
    const {nickname} = that.state;
    if (userInfo) {
      console.log(userInfo,' - -uuuuuuuu');
      that.setState({
        // userInfo,
        nickname
      })
      localStorage.setItem('USER_ID', userInfo.userID)
      localStorage.setItem('USER_AVATAR', userInfo.iconURL)
      if (userInfo && userInfo.avatarJSON) {
        that.setState({
          gender: JSON.parse(userInfo.avatarJSON).suitsDatas[0].gender,
          avatarJSON: userInfo.avatarJSON
        })
      }
      client.writeData({
        data: {
          userInfo: {
            iconURL: userInfo.iconURL,
            avatarBodyURL: userInfo.avatarBodyURL,
            __typename: 'userInfo'
          }
        }
      });
    }
  }

  refreshProfile = async () => {
    let times = 0;
    const {
      client
    } = this.props;
    const that = this;
    let userInfoSubscribe = client.watchQuery({
      query: QUERY_MYSELF,
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
      // passCondition: ['data', 'queryMyself', 'userInfo'],
      // errorCode: 'GET_USER_FAILED',
      pollInterval: 1500
    })
    // userInfoSubscribe.startPolling(2000);
    userInfoSubscribe.subscribe({
      next(next) {
        times++;
        console.log(times);
        if (!next.loading) {
          if(next.data && next.data.queryMyself && next.data.queryMyself.userInfo) {
            let userInfo = next.data.queryMyself.userInfo
            that.saveUserInfo(userInfo, that);
            if(times >= 10 || next.data.queryMyself.iconURL) {
              userInfoSubscribe.stopPolling();
            }
          }
        }
      },
      error(err) {
        console.log(err);
      },
      complete() {
        console.log('complete');
      }
    })
  }

  // 绑定设置Name的函数
  handleChangeName = (e) => {
    let nickname = e.target.value
    // 正则去掉空格
    nickname = nickname.replace(/\s*/g, "")
    this.setState({
      nickname: nickname
    })
  }

  generateNickname = (e) => {
    const { gender } = this.state;
    // 1:男  2:女
    let fakeratorName = gender === 2 ? fakerator.names.firstNameF : fakerator.names.firstNameM;
    let arrLen = 5;
    let fakeratorArr = fakerator.times(fakeratorName, arrLen);
    let nickname = ''
    for (let i = 0; i < fakeratorArr.length; i++) {
      let nameLen = charCodeLen(fakeratorArr[i])
      if (fakeratorArr[i].length && nameLen >= 4 && nameLen <= 20) {
        nickname = fakeratorArr[i]
        break;
      } else if (i === arrLen - 1) {
        nickname = fakeratorArr[i]
      }
    }
    this.setState({
      nickname
    })
  }

  // setNickname = (_nickname) => {
  //   const { client } = this.props;
  //   let nickname = _nickname ? _nickname : this.state.nickname;
  //   return new Promise((resolve, reject) => {
  //     client.mutate({
  //       mutation: SET_NICKNAME,
  //       variables: {
  //         nickname
  //       }
  //     }).then(dt => {
  //       if (dt.data && dt.data.setUserNickname && dt.data.setUserNickname.code === 0) {
  //         return resolve({
  //           pass: true,
  //           msg: 'Set nickname success.'
  //         })
  //       } else {
  //         return resolve({
  //           pass: false,
  //           msg: 'Set nickname fail.'
  //         })
  //       }
  //     }).catch(error => {
  //       return resolve({
  //         pass: false,
  //         msg: 'Set nickname error.',
  //         error
  //       })
  //     })
  //   })
  // }

  // queryMyself = () => {
  //   const { client } = this.props;
  //   return new Promise(((resolve, reject) => {
  //     client.query({
  //       query: QUERY_MYSELF,
  //       fetchPolicy: 'network-only'
  //     }).then(dt => {
  //       if (dt.data && dt.data.queryMyself) {
  //         return resolve({
  //           pass: true,
  //           msg: 'Query myself success.',
  //           data: dt.data.queryMyself
  //         })
  //       }
  //     }).catch(error => {
  //       return resolve({
  //         pass: false,
  //         msg: 'Query myself error.',
  //         error
  //       })
  //     })
  //   }))
  // }

  finishSetting = async () => {
    const {
      history,
      client,
      originalNickname,
      intl
    } = this.props;
    let { nickname, avatarJSON, userInfo = {} } = this.state;
    let avatar_json = {
      name: nickname,
      avatarJSON: userInfo.avatarJSON,
      hasAvatar: userInfo.hasAvatar
    }

    // avatarJSON是否为空
    // if (!avatarJSON) {
    //   return message.info(
    //     <GlobalMessage
    //       description={intl.messages['new_landing.set_nickname.set_avatar']}
    //       type="error"
    //     />
    //   )
    // }

    // 头像是否为空
    // if (!userInfo.iconURL) {
    //   return message.info(
    //     <GlobalMessage
    //       description={intl.messages['new_landing.set_nickname.set_picture']}
    //       type="error"
    //     />
    //   )
    // }

    // 校验名字是否符合要求
    const nameRegExp = /^((?!\\|\/|:|\*|\?|\$|\(|\)|（|）|!|！|#|@|<|>|\||\^|\+|=|-|,|<|>|~|`|'|%).){4,20}$/
    let nameLen = charCodeLen(nickname)
    if (!nameRegExp.test(nickname) || (nameLen < 4 || nameLen > 20)) {
      return message.info(
        <GlobalMessage
          description={intl.messages['landing.nickname.validate']}
          type="error"
        />
      )
    }

    if (originalNickname && originalNickname === nickname) {
      let originResult = await wordFilter(originalNickname);
      console.log(originResult, ' - - -this is origin Result');
      if (originResult && !originResult.pass) {
        return message.warn(
          <GlobalMessage
            description={intl.messages['new_landing.set_nickname.sensitive'] + `"${originResult.text}"`}
            type="warning"
          />
        )
      }

      _historyHandler({ jump: "/home/games", history });
      unityJSON('showFloatWeb', avatar_json);
      return;
    }

    let filterResult = await wordFilter(nickname);
    if (filterResult && !filterResult.pass) {
      return message.warn(
        <GlobalMessage
          description={intl.messages['new_landing.set_nickname.sensitive'] + `"${filterResult.text}"`}
          type="warning"
        />
      )
    }

    // nickname changed
    const code = await client._mutate({
      mutation: SET_NICKNAME,
      variables: {
        nickname
      },
      //
      passCondition: ['data', 'setUserNickname', 'code'],
      passMatch: 0,
      passCode: 'SET_NICKNAME_SUCCESS',
      errorCode: 'SET_NICKNAME_FAIL'
    })
    if (code === 0) {
      client.writeData({
        data: {
          userInfo: {
            nickname,
            __typename: 'userInfo'
          }
        }
      });
      _historyHandler({ jump: "/home/games", history });
      unityJSON('showFloatWeb', avatar_json);
    }
  }

  backToAvatar = () => {
    this._refreshInput();
    console.log('show avatar...');
    const { userInfo } = this.state;
    let avatar_json = {
      avatarJSON: userInfo.avatarJSON,
      hasAvatar: userInfo.hasAvatar
    }
    unityJSON('showAvatar', avatar_json);
  }

  render () {
    const webpackContext = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    const { nickname, userInfo, privacyTitle, loadedImg, isInputBlur } = this.state;
    const { intl } = this.props;

    return (
      <div className="landing-nickname" ref={el => this.nickNameRef = el}>
        <BtnBack goBack={() => this.backToAvatar()} />

        <div className="landing-nickname-edit">
          <p>
            <FormattedMessage id="new_landing.set_nickname.yourname" />
            {/* What's Your Name？ */}
          </p>
          {
            loadedImg ? (
              <div className="bg-head-img" style={{
                backgroundImage: `url(${loadedImg === '' ? images['Icon_head.png'] : loadedImg})`
              }}>
              </div>
            ) : (
                <div className="bg-head-img data-loading"></div>
              )
          }
          <div className="landing-nickname-edit-input">
            {
              isInputBlur ?
                <Input className="edit-input"
                  ref={el => this.nicknameInputRef = el}
                  value={nickname || ''}
                  placeholder={'Nickname...'}
                  onChange={this.handleChangeName}
                  required
                /> : null
            }
            <div className="img-middle">
              <img src={images['save_nickname.png']} alt="Submit"
                onClick={(e) => this.generateNickname(e)}
              />
            </div>
          </div>
        </div>
        <div className="landing-nickname-btn">
          <p>By clicking finish, you agree that you have read our
            <span ref={el => this.privacyRefs = el} onClick={() => { this.privacyVisible('Privacy Palicy') }}> Privacy Policy </span>
            and accept our<span ref={el => this.termsRefs = el} onClick={() => { this.privacyVisible('Terms') }}> Terms</span>.</p>
          <BtnBasic type="bottom" okText={intl.messages['new_landing.set_nickname.finish']} loading={false} onClick={() => this.finishSetting()} />
        </div>

        <Drawer
          // title="Privacy Palicy"
          placement="bottom"
          closable={false}
          onClose={this.privacyClose}
          visible={this.state.visible}
          className="landing-nickname-drawer"
          drawerStyle={{
            height: '88vh',
            animation: 'privacyAnimation .5s linear'
          }}
        >
          <div ref={el => this.drawerContent = el}>
            <div className="drawer-title"><span>{this.state.privacyTitle}</span></div>
            <div className="drawer-content">
              {
                privacyTitle === 'Terms' ? (<Terms />) :
                  privacyTitle === 'Privacy Palicy' ? (<PrivacyPalicy />) : null
              }
            </div>
          </div>
        </Drawer>

        <ImgLoade imgUrl={userInfo && userInfo.iconURL ? userInfo.iconURL : ''}
          loadedImg={(value) => this.setState({ loadedImg: value })} />
      </div>
    )
  }
}

const NicknameWithRouter = withRouter(withApollo(injectIntl(EditNickName)));
delete NicknameWithRouter.contextType;
export default NicknameWithRouter;
