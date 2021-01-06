import React from 'react';
import { history } from 'react-router-guard'
import { message } from 'antd';
import * as qs from 'query-string';
import { isEmpty } from 'lodash';

import { setClient } from "apollo/apollo-set-server";
import { getQS, setQS, setStateAsync, _getIn, _isInLocalStorage, errorHandler } from "utils";
import { unityJSON, unityUnlisten, unityListen, cacheAllUnityFunctions } from "utils/lib/unity";
import { API_URL } from 'states/APP_STATE';

import { createIntl } from 'react-intl';
import GlobalMessage from "components/partial/message/GlobalMessage";

import i18n from "i18n/index.js";
import {
  LOGIN_LOCATION_SEARCH,
  QS_STRING,
  GAME_STARTED,
  GAME_LOADING,
  PHONE_INFO,
  TEAM_GAME_PLAYING,
  TEAM_GAME_CREATING,
  GAME_ERROR
} from "utils/constants";
import {
  GET_TEAM_INVITE_MSG,
  GET_TEAM_INFO,
  JOIN_GAME_V2,
  LEAVE_TEAM,
  ACCEPT_TEAM_INVITE,
  REJECT_TEAM_INVITE,
  LEAVE_GAME,
  QUERY_MYSELF,
  INVITE_TEAM_MEMBERS
} from "@gql"

import { IntlProvider } from 'react-intl';
import { SERVER } from "states/APP_STATE";



const PlatformContext = React.createContext('platform');
const { Provider, Consumer } = PlatformContext;

const locale = ((SERVER === 'prod' || SERVER === 'local' || SERVER === 'approval' || SERVER === 'beta' || SERVER === 'alpha') ? 'zh' : 'en');
const messages = i18n[locale]

const intl = createIntl({
  locale,
  messages
})

const i18nMsg = i18n[locale];
message.config({
  maxCount: 7
})

let retryTimer

class PlatformProvider extends React.Component {
  constructor(props) {
    super(props)
    this.handleSubscriptionError = this.handleSubscriptionError.bind(this)
    let QS;
    let urlString;
    try {
      urlString = window.location.search;
      if (urlString) {
        localStorage.setItem(LOGIN_LOCATION_SEARCH, urlString);
      }
      QS = qs.parse(urlString);
    } catch (e) {
      alert('Your app do not support query-string');
    }

    this.state = {
      // i18n
      i18nConfig: {
        locale,
        messages: i18n[locale],
      },
      i18nMsg,
      userAgent: navigator.platform,
      online: navigator.onLine,
      token: '',
      account: '',
      api: '',
      serverName: '',
      version: '',
      phoneInfo: {
        model: "",
        s_v: "",
        device: "",
        app_v: "",
        aid: ""
      },
      messageMap: {},
      QS,
      client: null,
      platform: '',
      mode: '',
      deviceID: '',
      // 组队
      init: false,
      teamInfoVersion: '0',
      teamInviteVersion: '0',
      userInfo: {},
      teamInviteMsg: [],
      teamInfo: {},
      gamePreparing: null,
      gameStatus: "",
      gqlErrorCount: 0,
      waitingForLeader: false,
      isWindows: navigator.platform.startsWith('Win'),
      loadingModal: false,
      alertModalOptions: null,
      alertGameOptions: null,
      msgGameOptions: null,
      msgWarningOptions: null,
      basicModalOptions: null,
      _toggleAlertModal: null,
      inGameJoinTeamInfo: null,
      leaveGame: this.leaveGame,
      joinTeam: this.joinTeam,
      joinGame: this.joinGame,
      prepareGame: this.prepareGame,
      cancelGame: this.cancelGame,
      showUnityModal: this.showUnityModal,
      showUnityMessage: this.showUnityMessage,
      showGlobalMessage: this.showGlobalMessage,
      showGlobalModal: this.showGlobalModal,
      _updateClient: this._updateClient,
      _updateState: this._updateState,
      _updateStateSync: null,
      _fetchUser: this._fetchUser,
      initData: this.initData,
      rejoinGame: this.rejoinGame
    }
  }

  async componentDidMount() {
    cacheAllUnityFunctions(['joinGame', 'prepareGame', 'inviteFriends', 'back', 'setAvatar', 'showFriends', 'openExternalUrl', 'showFloatWeb', 'showAvatar', 'setAutoLogin', 'userLogin', 'googleAuth', 'openAvatar', 'cancelGame', 'showDialog', 'showOtherAvatar', 'openAvatar'])
    let {
      QS
    } = this.state;
    if (isEmpty(QS)) {
      QS = getQS();
    } else {
      let local_QSString = _isInLocalStorage(QS_STRING);
      let final_QS;
      if (QS['resetQS']) {
        QS = setQS(JSON.stringify({}));
      } else {
        try {
          let local_QS;
          if (local_QSString) {
            local_QS = JSON.parse(local_QSString);
          } else {
            local_QS = {};
          }
          final_QS = Object.assign({}, local_QS, QS);
          let QSString = JSON.stringify(final_QS);
          QS = setQS(QSString);
        } catch (e) {
          alert('QSString not provide!')
        }
      }
    }

    let api = QS['api']
      ||
      API_URL
      ||
      // '';
      // 'http://47.103.112.134:9041/graphql';
      //'http://192.168.6.214:9041/graphql';
      // 'http://192.168.14.27:9041/graphql';
      // 'http://192.168.14.19:9041/graphql';
      // 'http://47.103.191.190:9041/graphql';
      //  'http://47.103.122.205:9041/graphql';
      // 'http://47.103.112.134:9041/graphql';
      'http://192.168.114.40:9041/graphql'
    //  'http://47.103.122.205:9041/graphql';
    // 'http://47.103.112.134:9041/graphql';

    const protocol = window.location.protocol;
    if(protocol === 'https:') {
      api = api.replace(/^http\:/, 'https:')
    }else if(protocol === 'http:') {
      api = api.replace(/^https\:/, 'http:');
    }else {
      console.log('protocol not supported!');
    }

    let token = QS['token'] || '';
    let serverName = QS['sn'] || '';
    let version = QS['v'] || '';
    let account = QS['account'] || '';
    let platform = QS['platform'] || '';
    let mode = QS['mode'] || '';
    let phoneInfo = _isInLocalStorage(PHONE_INFO);

    const commonGQL = (type, options) => {
      // passCondition 数组,通过条件
      // passCode 通过后的成功提示码 
      const { passCondition, passCode, errorCode, passMatch, needError, ...gqlOptions } = options
      return new Promise(async resolve => {
        try {
          let result;
          if (type === 'mutation') {
            result = await client.mutate(gqlOptions)
          } else {
            result = await client.query(gqlOptions)
          }
          console.log('graphql请求结果:')
          console.log(result)
          // 取data中的首个key返回的错误码
          const data = _getIn(result, 'data')
          const code = _getIn(data, Object.keys(data)[0], 'code')
          if (code !== 0 && typeof (code) !== 'undefined') {
            console.log('error code:' + code)
            this.showGlobalMessage({
              //先走服务器错误码映射,再走错误码自定义映射,最后走 0000 作为默认服务端错误码
              content: i18nMsg[code] || i18nMsg[errorCode] || i18nMsg["0000"],
              type: 'error'
            })
            return resolve('')
          }
          if (passCondition) {
            if (_getIn(result, ...passCondition) !== undefined) {
              // 如果定义了passCode 做成功弹窗
              if (!passMatch || _getIn(result, ...passCondition) === passMatch) {
                passCode && this.showGlobalMessage({
                  content: i18nMsg[passCode],
                  type: 'success'
                })
                return resolve(_getIn(result, ...passCondition))
              }
            }
            //定义了passCondition却没pass 则弹报错
            this.showGlobalMessage({
              content: i18nMsg[errorCode] || i18nMsg["0001"],
              type: 'error'
            })
            return resolve('')
          }
          // 没有passCondition则做静默处理
          resolve(result)
        } catch (err) {
          console.log('catched error', err)
          console.log(errorCode)
          // gql错误处理
          // const gqlError = _getIn(err, 'graphQLErrors', 'length');
          const gqlErrorMsg = errorHandler({
            error: err,
            mapping: i18nMsg
          });
          if (needError) {
            resolve({
              error: true,
              code: errorCode
            })
            return
          }

          console.log(i18nMsg[errorCode] || gqlErrorMsg || i18nMsg["0001"])
          this.showGlobalMessage({
            content: gqlErrorMsg || i18nMsg[errorCode] || i18nMsg["0001"],
            type: 'error'
          })
          resolve('')
        }
      })
    }

    const client = setClient({
      api,
      token,
      platform
    })

    client._mutate = (options) => {
      return commonGQL('mutation', options)
    }

    client._query = (options) => {
      return commonGQL('query', options)
    }

    window.addEventListener('online', () => {
      const { online } = this.state
      console.log('用户online')
      if (!online) {
        console.log('offline重连')
        this.initData();
      }
    });
    window.addEventListener('offline', () => {
      console.log('用户offline')
      this.setState({
        online: false
      })
    });

    await setStateAsync(
      phoneInfo ? {
        platform, mode, api, token, serverName, version, account,
        client,
        phoneInfo: JSON.parse(phoneInfo)
      } : {
          platform, mode, api, token, serverName, version, account,
          client,
        }, this);

    // 资源市场页面相关
    const exceptions = ['/landing/login', '/mart/assets', '/mart-max/assets', '/my', '/disk'];
    const isException = exceptions.reduce((acc, cur) => {
      let isContainURL = history.location.pathname.indexOf(cur) >= 0 && history.location.pathname !== '/';
      return acc || isContainURL;
    }, false);
    if (isException) {
      return;
    }

    unityListen('network_close', () => {
      console.log('network_close')
      this.initData();
    })
    unityListen('joinTeam', (gameID, teamInfo) => {
      console.log('收到unity的 join team')
      this.joinTeam(gameID, teamInfo);
    })
    unityListen('clickMessage', options => {
      const { type, params } = options
      const { inviteID } = params
      // alert(JSON.stringify(options))
      if (type === 0) {
        //组队逻辑
        this.showAcceptInviteDialog(params)
      }
      this.state.messageMap[inviteID] && this.state.messageMap[inviteID]();
    })
    unityListen('closeMessage', options => {
      const { type, params } = options
      const { inviteID, gameID } = params
      if (type === 0) {
        this.confirmRejectTeamInvite(inviteID, gameID)
      }
      this.state.messageMap[inviteID] && this.state.messageMap[inviteID]();
    })
    unityListen('teamInvite', params => {
      console.log('收到teamInvite')
      this.inviteTeamMember(params)
    })

    const teamMsgOptions = {
      query: GET_TEAM_INVITE_MSG,
      fetchPolicy: 'network-only',
      fetchResults: false,
      pollInterval: 3000,
      variables: {
        version: '0'
      }
    }
    const teamInfoOptions = {
      query: GET_TEAM_INFO,
      fetchPolicy: 'network-only',
      fetchResults: false,
      pollInterval: 1000,
      variables: {
        version: '0',
        teamID: '0'
      }
    }

    // 绑定订阅处理事件
    const teamMsgSubscription = this.subscriptionHandler(teamMsgOptions, this.teamInviteSubscriptionHandler, 'teamInviteMsg');
    const teamInfoSubscription = this.subscriptionHandler(teamInfoOptions, this.teamInfoSubscriptionHandler, 'teamInfo');
    this.setState({ teamMsgSubscription, teamInfoSubscription })

    // 监听路由跳转获取服务端数据
    history.listen(location => {
      const isException = exceptions.reduce((acc, cur) => {
        let isContainURL = location.pathname.indexOf(cur) >= 0;
        return acc || isContainURL;
      }, false);
      if (isException) {
        return;
      }
      if (location.pathname.indexOf('landing') === -1) {
        const { init } = this.state
        console.log('在landing页面之外跳转')
        if (!init) {
          this.initData();
          this.setState({ init: true })
        }
      }
    })
    // 刷新页面同样处理监听
    if (history.location.pathname.indexOf('landing') === -1 && history.location.pathname !== '/') {
      console.log('在landing页面之外刷新')
      this.initData();
    }
  }

  componentWillUnmount() {
    document.removeEventListener('subscription error', this.handleSubscriptionError)
    localStorage.removeItem('pageActive')
  }

  _fetchUser = async () => {
    const { client } = this.state
    const userInfo = await client._query({
      query: QUERY_MYSELF,
      passCondition: ['data', 'queryMyself', 'userInfo']
    })
    if (userInfo) {
      this.setState({
        userInfo
      })
    }
  }

  handleNetworkError = () => {
    const { teamInfoSubscription, gameStatus, i18nMsg } = this.state
    this.showGlobalModal({
      confirmTxt: i18nMsg["message.reconnect"],
      cancelTxt: i18nMsg["message.cancel"],
      content: i18nMsg["message.connection_lost"],
      icon: "Icon_Disconnect.png",
      topTitle: i18nMsg["message.warning"],
      asyncConfirm: this.initServerData,
      cancelCb: () => {
        if (_getIn(teamInfoSubscription, 'subscribing') && gameStatus === GAME_LOADING) {
          this.setState({
            gameStatus: ''
          })
        }
        teamInfoSubscription._unsubscribe();
        this.setState({
          basicModalOptions: null
        })
      }
    })
  }

  initData = async () => {
    this.setState({ init: true })
    try {
      await this.initServerData();
    } catch (err) {
      console.log('服务端错误')
      this.handleNetworkError();
    }
  }

  initServerData = () => {
    const { teamInfoSubscription, userInfo } = this.state
    return new Promise(async (resolve, reject) => {
      // 维持订阅状态
      //teamMsgSubscription._subscribe()
      this._fetchUser();
      // 获取当前组队请求列表
      let teamInfoRes
      try {
        teamInfoRes = await teamInfoSubscription._query()
      } catch (err) {
        console.log('捕获到请求错误')
        console.log(err)
        reject()
        return
      }
      let teamInfo = _getIn(teamInfoRes, 'data', 'teamInfo')
      let hideModal = true;
      console.log('初始化服务器端数据队伍信息')
      document.addEventListener('subscription error', this.handleSubscriptionError)
      if (teamInfo) {
        console.log('在队伍')
        const { gameInfo } = teamInfo
        if (teamInfo.state === TEAM_GAME_PLAYING) {
          console.log('在游戏')
          hideModal = false
          this.showGlobalModal({
            icon: _getIn(gameInfo, 'iconURL'),
            confirmTxt: i18nMsg["message.reconnect"],
            cancelTxt: i18nMsg["message.cancel"],
            content: intl.formatMessage({ id: 'message.rejoin_game', defaultMessage: i18nMsg["message.rejoin_game"] }, { gameName: _getIn(gameInfo, 'gameName') }),
            topTitle: i18nMsg["message.info"],
            successCb: () => this.rejoinGame(teamInfo),
            cancelCb: () => this.leaveGame(false, gameInfo)
          })

        } else if (_getIn(teamInfo, 'members', 'length') > 1 && _getIn(teamInfo, 'leaderID') !== _getIn(userInfo, 'userID')) {
          const gameID = _getIn(gameInfo, 'gameID')
          gameID && this.joinTeam(gameID)
        } else if (teamInfo.state === TEAM_GAME_CREATING) {
          this.setState({
            teamInfo: {},
            gameStatus: ''
          })
          return
        }
        const gameStatusMap = {
          TEAM_GAME_CREATING: GAME_LOADING,
          TEAM_GAME_PLAYING: GAME_STARTED
        }
        this.setState({
          teamInfo,
        })
      } else {
        this.setState({
          teamInfo: {},
          gameStatus: ''
        })
      }
      if (_getIn(teamInfoRes, 'data')) {
        console.log('连接成功')
        if (hideModal) {
          // unityJSON('closeDialog')
          this.setState({
            basicModalOptions: null,
            teamInfo: teamInfo || {}
          })
        }
        resolve()
      } else {
        reject()
      }
    })
  }

  subscriptionHandler = (options, callback, versionKey) => {
    const _this = this
    const { client } = this.state
    const { pollInterval, ...queryOptions } = options
    const subscription = client.watchQuery(options)
    subscription.version = "0"
    subscription.continue = true

    // 更新轮询参数
    subscription._updateVariables = function (newVariables) {
      return new Promise(async (resolve) => {
        const { variables } = subscription.options
        const option = subscription.options
        option.variables = Object.assign(variables, newVariables)
        if (_getIn(newVariables, 'version')) {
          subscription.version = _getIn(newVariables)
        }
        await subscription.setOptions(option)
        resolve()
      })
    }

    // 单次查询
    subscription._query = function () {
      return client.query(queryOptions)
    }
    // 绑定订阅事件
    subscription._subscribe = function () {
      if (!subscription.subscribing) {
        console.log('开始订阅' + subscription.queryName)
        subscription.startPolling(pollInterval)
        subscription.subscribing = true;
        subscription.subscribe({
          async next(next) {
            if (!next.loading) {
              const optionVersion = _getIn(subscription, 'variables', 'version') || '0'
              const version = _getIn(next, 'data', versionKey, 'version')
              if (version && version !== optionVersion) {
                console.log('订阅更新', subscription)
                subscription.version = version
                if (subscription.continue) {
                  callback(next)
                }
                subscription.continue = false
                await subscription._updateVariables({ version })
                subscription.continue = true
              }
            }
          },
          error(err) {
            console.log('subscription error:' + JSON.stringify(err))
            const gqlError = _getIn(err, 'graphQLErrors', 'length')
            const gqlErrorEvent = new CustomEvent('subscription error', { detail: subscription });
            if (gqlError) {
              //graphQL error派发事件,进行重试
              console.log('graphql error')
              if (!retryTimer) {
                document.dispatchEvent(gqlErrorEvent)
              }
            } else {
              _this.handleNetworkError();
            }
            subscription.subscribing = false
          },
          complete() {
            subscription.subscribing = false
            console.log('complete')
          }
        })
      }
    }
    //绑定退订事件
    subscription._unsubscribe = function () {
      console.log('取消订阅')
      subscription.stopPolling()
      subscription.subscribing = false
    }


    //重置订阅
    subscription._reset = async function () {
      console.log('重置订阅')
      subscription.version = "0"
      subscription.setOptions(options)
      localStorage.removeItem(versionKey)
    }
    return subscription
  }

  handleSubscriptionError = event => {
    const subscription = _getIn(event, 'detail')
    if (subscription) {
      let count = 0
      retryTimer = setInterval(async () => {
        console.log('重试中...' + count)
        let result
        try {
          result = await subscription._query()
        } catch (err) {
          count++
        }
        if (result) {
          console.log('重连result', result)
          subscription._subscribe()
          clearInterval(retryTimer)
          retryTimer = false
        } else if (count > 5) {
          console.log('重试次数到,发送连接错误')
          this.handleNetworkError();
          clearInterval(retryTimer)
          retryTimer = false
        }
      }, 2000)
    }
  }

  teamInviteSubscriptionHandler = async (next) => {
    const msgList = _getIn(next, 'data', 'teamInviteMsg', 'inviteList')
    if (msgList) {
      let messageMap = {};
      msgList.forEach(item => {
        const messageCb = this.showGlobalMessage({
          icon: item.iconURL,
          content: `${item.inviterName} invite you to play ${item.gameName}`,
          duration: 0,
          type: 'invite',
          params: item,
          onClose: () => {
            this.confirmRejectTeamInvite(item.inviteID, item.gameID)
          },
          onOpen: () => {
            this.showAcceptInviteDialog(item)
          }
        })
        if (messageCb) {
          messageMap[item.inviteID] = messageCb
          this.setState({
            messageMap
          })
        }
      })
    }
  }

  confirmRejectTeamInvite = async (inviteID) => {
    const { client, teamMsgSubscription } = this.state
    teamMsgSubscription._reset();
    const rejectRes = await client._mutate({
      mutation: REJECT_TEAM_INVITE,
      variables: {
        input: {
          inviteID
        }
      }
    })
    this.setState({ basicModalOptions: null })
  }

  showAcceptInviteDialog = async (inviteInfo) => {
    const { inviterName, gameName, iconURL, inviteID, gameID } = inviteInfo
    const { teamInfo, client } = this.state
    const teamID = _getIn(teamInfo, 'teamID')
    this.showGlobalModal({
      avatar: iconURL,
      confirmTxt: "Join",
      cancelTxt: "Nope",
      content: `${inviterName} invite you to play ${gameName}`,
      successCb: () => {
        if (teamID) {
          this.showGlobalModal({
            confirmTxt: "Yes",
            cancelTxt: "No",
            content: `Do you want to leave current team?`,
            successCb: async () => {
              await client._mutate({
                mutation: LEAVE_TEAM,
                variables: {
                  input: {
                    teamID: teamInfo.teamID
                  }
                }
              })
              this.confirmAcceptTeamInvite(inviteID, gameID)
            },
            cancelCb: () => this.confirmRejectTeamInvite(inviteID, gameID),
          })
          return
        }
        this.confirmAcceptTeamInvite(inviteID, gameID)
      },
      cancelCb: () => {
        this.confirmRejectTeamInvite(inviteID, gameID)
      }
    })
  }

  inviteTeamMember = async (params) => {
    const { client, teamInfoSubscription } = this.state
    const { gameID, userIDList } = params
    const inviteTeamMembers = await client._mutate({
      mutation: INVITE_TEAM_MEMBERS,
      variables: {
        input: {
          gameID,
          userIDList
        }
      },
      passCondition: ['data', 'inviteTeamMembers'],
    })
    if (inviteTeamMembers) {
      teamInfoSubscription._subscribe();
    }
  }

  confirmAcceptTeamInvite = async (inviteID, gameID) => {
    const { client } = this.state
    const acceptCode = await client._mutate({
      mutation: ACCEPT_TEAM_INVITE,
      variables: {
        input: {
          inviteID
        }
      },
      passCondition: ['data', 'acceptTeamInvite', 'code'],
      errorCode: 'TEAM_CLOSED'
    })
    this.setState({ basicModalOptions: null })

    console.log(acceptCode)
    if (acceptCode === 0) {
      this.joinTeam(gameID)
    }
  }

  prepareGame = (gameInfo) => {
    const { gamePreparing } = this.state;
    let cachedPreparing
    try {
      cachedPreparing = JSON.parse(localStorage.getItem('gamePreparing'))
    } catch (err) {

    }
    const gameToCancel = gamePreparing || cachedPreparing
    console.log('正在准备中的游戏', gameToCancel)
    const prepare = () => {
      console.log('开始准备游戏', gameInfo)
      unityJSON('prepareGame', gameInfo)
      this.setState({ gamePreparing: gameInfo })
      localStorage.setItem('gamePreparing', JSON.stringify(gameInfo))
    }
    if (gameToCancel) {
      this.cancelGame(gameToCancel)
      setTimeout(() => {
        prepare()
      }, 2000)
      return
    }
    prepare()
  }

  cancelGame = (gameInfo) => {
    unityJSON('cancelGame', gameInfo)
    this.setState({ gamePreparing: null })
    localStorage.removeItem('gamePreparing')
  }

  joinTeam = (gameID, teamInfo) => {
    const { teamInfoSubscription } = this.state
    if (teamInfo) {
      console.log('inGameJoinTeamInfo', teamInfo)
      this.setState({
        inGameJoinTeamInfo: teamInfo,
        gameStatus: GAME_LOADING
      })
      this.prepareGame({ ...teamInfo, landscape: false })
      history.push(`/home/games/${gameID}?type=change`)
      return
    } else {
      history.push(`/home/games/${gameID}?type=join`)
      teamInfoSubscription._reset()
      teamInfoSubscription._subscribe()
      this.setState({
        waitingForLeader: true,
        gameStatus: GAME_LOADING
      })
      let count = 0;
      let timer = setInterval(async () => {
        const { teamInfo, waitingForLeader } = this.state;
        const game = _getIn(teamInfo, 'gameInfo')
        console.log('搜索中...', waitingForLeader)
        if (game && history.location.pathname.indexOf(game.gameID) > -1) {
          clearInterval(timer)
          count = 0;
          if (!waitingForLeader) {
            console.log('互相邀请不再准备游戏')
            return
          }
          this.setState({ gameStatus: GAME_LOADING })
          this.prepareGame({ ...game, landscape: false })
          console.log('组队队员准备prepareGame', game)
        }
        if (count > 120) {
          console.log('准备游戏超时')
          clearInterval(timer);
        }
      }, 1000)
    }
  }

  teamInfoSubscriptionHandler = async next => {
    const { userInfo, teamInfo, teamInfoSubscription, waitingForLeader } = this.state
    let serverTeamInfo = _getIn(next, 'data', 'teamInfo')
    console.log('服务端队伍信息')
    console.log(serverTeamInfo)
    if (serverTeamInfo) {
      const { leaderID, teamID } = serverTeamInfo;
      //unityJSON('teamInfoUpdate', serverTeamInfo)
      if (teamID) {
        await teamInfoSubscription._updateVariables({ teamID })
      }
      if (_getIn(serverTeamInfo, 'leaderID') && _getIn(serverTeamInfo, 'leaderID') === _getIn(userInfo, 'userID') && waitingForLeader) {
        console.log('不再等待队长')
        const clearTimer = new CustomEvent('clear timer');
        document.dispatchEvent(clearTimer)
        this.setState({
          gameStatus: '',
          waitingForLeader: false
        })
      }
      // 原先队伍信息是多人
      if (_getIn(teamInfo, 'members', 'length') > 1) {
        const originalLeaderID = _getIn(teamInfo, 'leaderID');
        // 当前有leaderID && 当前leaderID和服务端不一致 && 当前leaderID为当前用户ID
        // 队长变更
        if (originalLeaderID && leaderID !== originalLeaderID && _getIn(userInfo, 'userID') === leaderID) {
          console.log('队长发生变化')
          this.setState({ gameStatus: '' })
          this.cancelGame(_getIn(serverTeamInfo, 'gameInfo'))
          if (_getIn(serverTeamInfo, 'members', 'length') === 1) {
            this.leaveGame(true)
          }
          this.showGlobalModal({
            titleImg: '',
            content: i18nMsg["message.become_leader"],
          })
        }
      }
      // serverTeamInfo.members = serverTeamInfo.members.concat([
      //   { userID: 1 },
      //   { userID: 2 },
      //   { userID: 3 },
      //   { userID: 4 },
      //   { userID: 5 },
      //   { userID: 6 },
      //   { userID: 7 },
      // ])
      // serverTeamInfo.pendingMembers = serverTeamInfo.pendingMembers.concat([
      //   { userID: 8 },
      //   { userID: 9 },
      //   { userID: 10 },
      //   { userID: 11 },
      // ])
      this.setState({
        teamInfo: serverTeamInfo
      })
    }
  }

  leaveGame = async (stayDetail, gameInfo) => {
    const { teamInfoSubscription, client } = this.state
    this.setState({ gameStatus: '', teamInfo: {} })
    // let teamInfoRes
    if (!stayDetail) {
      history.push('/home/games')
    }
    if (gameInfo) {
      console.log()
      this.cancelGame(gameInfo)
    }
    teamInfoSubscription._reset();
    teamInfoSubscription._unsubscribe();
    const leaveGameRes = await client._mutate({
      mutation: LEAVE_GAME,
      variables: {
        input: {
          gameToken: ''
        }
      },
      passCondition: ['data', 'leaveGameV1'],
      errorCode: 'LEAVE_GAME_FAILED'
    })
    if (leaveGameRes) {
      console.log('成功离队')
    } else {
      console.log('离队失败')
    }
    this.setState({ teamInfo: {} })
  }

  leaveTeam = async (TeamInfo) => {
    const { teamInfoSubscription, client, _updateState } = this.state
    const teamId = _getIn(TeamInfo, 'teamID')
    console.log('leaveTeam', TeamInfo)
    if (!teamId) {
      return
    }
    await client._mutate({
      mutation: LEAVE_TEAM,
      variables: {
        input: {
          teamID: teamId
        }
      }
    })
    _updateState({ basicModalOptions: null, teamInfo: {}, status: '', gameStatus: '' })
    teamInfoSubscription._unsubscribe();
  }



  joinGame = async (teamInfoParam) => {
    const { teamInfoSubscription, version, inGameJoinTeamInfo } = this.state
    let count = 0;
    let error = false;
    if (inGameJoinTeamInfo) {
      const { gameID, roomId, assetHash, assetID } = inGameJoinTeamInfo
      const joinGameRes = await this.state.client._mutate({
        mutation: JOIN_GAME_V2,
        variables: {
          input: {
            gameID,
            roomID: roomId,
            gameToken: '',
            version
          }
        },
        passCondition: ['data', 'joinGameV2', 'roomInfo'],
        errorCode: "START_GAME_FAILED"
      })
      if (joinGameRes) {
        const { roomAddr, roomPort, roomToken } = joinGameRes
        const passingTeamInfo = {
          gameInfo: {
            gameID,
            assetHash,
            assetID
          },
          roomInfo: {
            roomID: roomId,
            roomAddr,
            roomPort,
            roomToken
          }
        }
        console.log('转换开始游戏成功', passingTeamInfo)
        unityJSON('joinGame', passingTeamInfo);
      } else {
        console.log('开始游戏失败')
        this.cancelGame(inGameJoinTeamInfo)
        this.setState({ gameStatus: GAME_ERROR })
        const gameError = new CustomEvent('game error');
        document.dispatchEvent(gameError)
      }
      this.setState({
        inGameJoinTeamInfo: null
      })
      return
    }
    console.log('开启启动游戏计时')

    let timer = setInterval(async () => {
      const { teamInfo, userInfo } = this.state;
      let currentTeamInfo = teamInfoParam || teamInfo
      const { gameInfo, roomInfo } = currentTeamInfo;
      if (gameInfo && roomInfo) {
        clearInterval(timer);
        timer = undefined
        count = 0
        const { gamePreparing } = this.state;
        if (gamePreparing) {
          const { assetID } = gamePreparing;
          if (gameInfo.assetID !== assetID) {
            console.log('发现assetID不一致,重新准备游戏',gameInfo.assetID,assetID)
            this.cancelGame(gamePreparing)
            this.prepareGame({ ...gameInfo, landscape: false })
            return
          }
        }
        console.log('获取到游戏房间信息,向unity发playGame')
        const joinGameRes = await this.state.client._mutate({
          mutation: JOIN_GAME_V2,
          variables: {
            input: {
              gameID: gameInfo.gameID,
              roomID: roomInfo.roomID,
              gameToken: '',
              version
            }
          },
          passCondition: ['data', 'joinGameV2', 'roomInfo'],
          errorCode: "START_GAME_FAILED"
        })
        clearInterval(timer);
        if (joinGameRes) {
          console.log('开始游戏成功', joinGameRes)
          console.log(teamInfo)
          // 服务端返回了roomInfo更新到teamInfo里
          teamInfo.roomInfo = joinGameRes
          unityJSON('joinGame', teamInfo);
        } else {
          console.log('开始游戏失败')
          this.cancelGame(gameInfo)
          this.setState({ gameStatus: GAME_ERROR })
          const gameError = new CustomEvent('game error');
          document.dispatchEvent(gameError)
        }
        teamInfoSubscription._unsubscribe()
        return
      } else {
        count += 1;
        if (count === 60) {
          if (_getIn(teamInfo, 'leaderID') && _getIn(teamInfo, 'leaderID') !== _getIn(userInfo, 'userID')) {
            console.log('队员的情况下维持轮询')
            return
          }
          count = 0
          clearInterval(timer);
          timer = undefined
          error = true;
          console.log('开始游戏超时', error)
          if (error) {
            const gameError = new CustomEvent('game error', { detail: 'timeout' });
            document.dispatchEvent(gameError)
            error = false
          }
        }
      }
    }, 1000)
    document.addEventListener('clear timer', event => {
      console.log('timer', timer)
      const { teamInfo } = this.state;
      let currentTeamInfo = teamInfoParam || teamInfo
      const { gameInfo } = currentTeamInfo;
      console.log('取消启动游戏计时')
      clearInterval(timer);
      timer = undefined
      this.cancelGame(gameInfo)
      return
    })
  }



  rejoinGame = (teamInfo) => {
    const { gameInfo } = teamInfo
    this.setState({
      basicModalOptions: null
    })
    if (!gameInfo) {
      this.showGlobalMessage({
        content: 'Join game failed',
        type: "error"
      })
      return
    }
    this.prepareGame({ ...gameInfo, landscape: false })
    const { gameID } = gameInfo
    //this.joinGame(teamInfo)
    if (history.location.pathname.indexOf('games/game') === -1) {
      //localStorage.setItem('rejoin', true)
      history.push(`/home/games/${gameID}`)
      // _navigate(`/home/games/${gameID}`, 'homeGameDetail', {
      //   id: gameID
      // })
    }
  }

  showGlobalMessage = (options) => {
    const { icon, content, duration, params, type, onOpen, onClose } = options

    const time = typeof (duration) === 'undefined' ? 3 : duration;
    const typeMap = {
      'invite': 0,
      'success': 2,
      'error': 1
    }

    let msg = message.info(
      <GlobalMessage
        avatar={icon}
        description={content}
        type={type}
        onClose={() => {
          unityJSON('destroyMessage', { params, type: typeMap[type] })
          onClose && onClose();
          msg()
        }}
        onOpen={() => {
          unityJSON('destroyMessage', { params, type: typeMap[type] })
          onOpen && onOpen();
          msg()
        }}
      />, time)
    return msg
  }

  showGlobalModal = (options, params) => {
    const { title, content, confirmTxt, cancelTxt, avatar, icon, successCb, cancelCb, asyncConfirm, topTitle } = options;
    console.log('showGlobalModal', title, content)
    this.setState({
      basicModalOptions: {
        okText: confirmTxt,
        cancelText: cancelTxt,
        description: content,
        avatar,
        icon,
        topTitle,
        type: title,
        asyncConfirm,
        onConfirm: () => {
          successCb && successCb()
        },
        onClose: () => {
          cancelCb && cancelCb();
          this.setState({ basicModalOptions: null })
        }
      }
    })
  }

  showUnityModal = (options, successCb, cancelCb, async) => {
    unityListen('sure', () => {
      if (successCb) {
        successCb();
        unityUnlisten('sure');
      }
      !async && unityJSON('closeDialog');
    })

    unityListen('cancel', () => {
      if (cancelCb) {
        cancelCb();
        unityUnlisten('cancel');
      }
      unityJSON('closeDialog');
    })

    unityJSON('showDialog', options)
  }

  showUnityMessage = (params) => {
    unityJSON('showMessage', params)
  }

  _updateClient = client => {
    this.setState({
      client
    })
  }

  _updateState = stateObj => {
    this.setState(stateObj)
  }

  _updateStateSync = (key, stateObj) => {
    this.setState({
      [key]: null
    }, () => {
      this.setState({
        [key]: stateObj
      })
    })
  }

  render() {
    return (
      <Provider value={this.state}>
        <IntlProvider locale={locale} messages={messages}>
          {
            this.props.children
          }
        </IntlProvider>
      </Provider >
    )
  }
}

function withPlatform(Component) {
  return function Platformed(props) {
    return (
      <Consumer>
        {
          () => (<Component {...props} />)
        }
      </Consumer>
    )
  }
}

export {
  PlatformProvider,
  Consumer as PlatformConsumer,
  PlatformContext,
  withPlatform,
}
