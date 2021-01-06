import React, { Fragment } from 'react';
import { importAll, _getIn, charCodeLen, errorHandler, getImg, dateFormat, judgeTimeGap } from "utils";
import MyFriendCard from 'components/partial/card/MyFriendCard'
import UserCard from 'components/partial/UserCard'
import { Drawer } from 'antd';
import { unityJSON, unityListen } from "utils/lib/unity";
import { PlatformContext } from "states/context/PlatformContext";
import GameContext from '@/states/context/GameContext'
import Mask from 'components/partial/modal/Mask'
import { history } from 'react-router-guard'
import { QUERY_MYSELF, QUERY_USER_INFO, TRACK_CLIENT } from "apollo/graphql/gql";
import PreviewList from 'components/partial/PreviewList'

import { injectIntl } from "react-intl";
import Image from 'components/partial/image'

import { GAME_LOADING, TEAM_GAME_CREATING, TEAM_GAME_PLAYING, GAME_ERROR } from "utils/constants"
import { GET_GAME, PLAY_TEAM_GAME, LEAVE_GAME, TOGGLE_GAME_FAVOUR, VOTE_GAME, MAKE_COMMENT, GET_GAME_COMMENT, DELETE_COMMENT } from "@gql"

class GameDetail extends React.Component {
  constructor() {
    super()
    this.handleGameError = this.handleGameError.bind(this)
    this.handleScroll = this.handleScroll.bind(this)
  }

  static contextType = PlatformContext;
  state = {
    visibleDrawer: false,
    teamList: false,
    gameInfo: false,
    readyToPlay: false,
    gameDownloadingStatus: '',
    path: '',
    id: '',
    loading: true,
    loadingPercent: 0,
    topBarHeight: 70,
    topBarActive: false,
    allowUnityError: true,
    loadedImg: null,
    hasGameStatus: false,
    changingUpvote: false,
    displayUser: false,
    animation: false,
    windowHeight: document.getElementsByTagName("body")[0].clientHeight,
    changingFavor: false,
    hasMoreContent: false,
    currentPage: 0,
    pageSize: 5,
    readMore: false,
    commentInput: '',
    commentList: []
  }

  async componentDidMount() {
    const { _updateState } = this.context;
    history.listen(path => {
      console.log('path', path)
    })
    const isSwitchingGame = history.location.search === '?type=change'
    if (isSwitchingGame) {
      _updateState({ gameStatus: GAME_LOADING })
    }
    document.addEventListener('game error', this.handleGameError)
    window.addEventListener('scroll', this.handleScroll);

    unityListen('leaveGame', () => {
      this.leaveGame()
    })
    // 网络导致游戏退出
    unityListen('game_reconnect', async () => {
      this.tryReconnect()
    })
    unityListen('leaveAndJoinGame', async (gameID) => {
      const { joinTeam, _updateState } = this.context;
      this.setState({ gameDownloadingStatus: '' })
      _updateState({ gameStatus: GAME_LOADING })
      joinTeam(gameID)
      console.log('转换游戏')
    })
    unityListen('gameStatus', (status, progress) => {
      const { joinGame } = this.context;
      this.hideTeamList()

      switch (status) {
        case 0:
          console.log('game prepare failed')
          this.setState({ gameDownloadingStatus: 'failed' })
          this.setError('download')
          break;
        case 1:
          console.log('play game success');
          this.setState({ gameDownloadingStatus: 'success' })
          // setTimeout(() => {
          //   console.log('隐藏遮罩')
          //   _updateState({ gameStatus: '' })
          // }, 5000)
          break;
        case 2:
          console.log('game downloading busy')
          break;
        case 3:
          console.log('game downloading:');
          this.setState({ gameDownloadingStatus: 'loading', loadingPercent: progress })
          break;
        case 4:
          console.log('download failed')
          this.setState({ gameDownloadingStatus: 'failed' })
          this.setError('download')
          break;
        case 5:
          console.log('game downloading success');
          this.setState({ gameDownloadingStatus: 'downloaded' })
          break;
        case 6:
          console.log('prepare game failed');
          this.setState({ gameDownloadingStatus: 'failed' })
          const errorMap = {
            2: 'busy',
            4: 'join'
          }
          this.setError(errorMap[progress] || 'download')
          break;
        case 7:
          console.log('prepare game success');
          this.setState({ gameDownloadingStatus: 'prepared' })
          joinGame();
          break;
        case 8:
          console.log('join game failed');
          this.setState({ gameDownloadingStatus: 'failed' })
          this.setError('join')
          break;
        default:
          return
      }
      this.setState({ hasGameStatus: status !== 2 })
      console.log('game status:', status, progress)
    })
    const that = this;
    unityListen('refreshAvatar', async function () {
      console.log('收到换装事件')
      await that.refreshAvatar();
    });
    await this.refreshAvatar();
  }

  handleGameError = event => {
    const error = _getIn(event, 'detail')
    console.log('通知详情页启动失败', error)
    this.setError(error)
  }

  initDetailData = async () => {
    this.setState({
      loading: true
    })
    await this.updateGame()
    this.setState({
      loading: false
    })
    const gameLoad = new CustomEvent('game load');
    document.dispatchEvent(gameLoad)
    //延时动画
    setTimeout(() => {
      this.setState({
        animation: true
      })
      if (this.hiddenContent && this.content) {
        const contentHeight = this.hiddenContent.getBoundingClientRect().height;
        const maxHeight = this.content.getBoundingClientRect().height
        this.setState({
          hasMoreContent: contentHeight > maxHeight
        })
      }
    }, 100)
  }

  updateGame = async () => {
    return new Promise(async resolve => {
      const { client } = this.context;
      const {
        match: {
          params: {
            id
          }
        }
      } = this.props;
      const gameRes = await client._query({
        query: GET_GAME,
        fetchPolicy: 'no-cache',
        variables: {
          id
        },
      })
      const gameInfo = _getIn(gameRes, 'data', 'game')
      if (gameInfo) {
        gameInfo.gameID = gameInfo.id
        gameInfo.gameName = gameInfo.name;
        this.setState({ gameInfo });
      }
      resolve()
    })
  }

  refreshAvatar = async () => {
    const {
      client, _fetchUser
    } = this.context;
    let myselfDT = await this.queryMyself();
    if (myselfDT.pass) {
      _fetchUser();
      let myInfo = myselfDT.data;
      localStorage.setItem('USER_ID', myInfo.userInfo.userID)
      localStorage.setItem('USER_AVATAR', myInfo.userInfo.iconURL)
      client.writeData({
        data: {
          userInfo: {
            iconURL: myInfo.userInfo.iconURL,
            avatarBodyURL: myInfo.userInfo.avatarBodyURL,
            __typename: 'userInfo'
          }
        }
      });
    } else if (myselfDT.error) {
      errorHandler({
        error: myselfDT.error
      })
    } else {
      console.log('myself data issue');
    }
  }

  queryMyself = () => {
    const { client } = this.context;
    return new Promise(((resolve, reject) => {
      client.query({
        query: QUERY_MYSELF,
        fetchPolicy: 'network-only'
      }).then(dt => {
        if (dt.data && dt.data.queryMyself) {
          return resolve({
            pass: true,
            msg: 'Query myself success.',
            data: dt.data.queryMyself
          })
        }
      }).catch(error => {
        return resolve({
          pass: false,
          msg: 'Query myself error.',
          error
        })
      })
    }))
  }

  tryReconnect = async () => {
    const { showGlobalModal, teamInfoSubscription, rejoinGame, _updateState, initData } = this.context;
    let teamInfoRes
    try {
      teamInfoRes = await teamInfoSubscription._query()
    } catch (err) { }
    const teamInfo = _getIn(teamInfoRes, 'data', 'teamInfo')
    _updateState({ teamInfo: teamInfo || {} })
    console.log('重连队伍信息')
    console.log(teamInfoRes)
    if (!_getIn(teamInfo, 'roomInfo')) {
      showGlobalModal({
        confirmTxt: "Try again",
        cancelTxt: "Cancel",
        icon: "Icon_Disconnect.png",
        content: 'Cannot reconnect to game',
        successCb: () => {
          this.tryReconnect()
        },
        cancelCb: () => {
          initData()
        }
      })
      this.setState({ gameDownloadingStatus: '' })
      return
    }
    rejoinGame(teamInfo)
  }

  showDrawer = (gameInfo) => {
    const { teamInfo, showGlobalMessage, i18nMsg } = this.context;
    const { maxPlayers } = gameInfo
    const length = _getIn(teamInfo, 'members', 'length')
    if ((length && length >= maxPlayers) || maxPlayers <= 1) {
      showGlobalMessage({
        content: i18nMsg['game.team_member_full'],
        type: 'error'
      })
      return
    }
    unityJSON('inviteFriends', { gameid: gameInfo.id });
    // this.setState({
    //   visibleDrawer: true,
    // });
  };
  onClose = () => {
    this.setState({
      visibleDrawer: false,
    });
  };

  showTeamList = () => {
    this.setState({
      teamList: true,
    })
  }

  hideTeamList = () => {
    this.setState({
      teamList: false
    })
  }

  toggleUpvote = async () => {
    const { gameInfo: { id, voteType }, changingUpvote } = this.state;
    const { client } = this.context;
    if (changingUpvote) {
      return
    }
    this.setState({
      changingUpvote: true
    })
    await client._mutate({
      mutation: VOTE_GAME,
      variables: {
        input: {
          voteType: voteType === 'UPVOTE' ? 'NONVOTE' : 'UPVOTE',
          gameID: id
        }
      }
    })
    this.updateGame()
    if (voteType === 'NONVOTE') {
      setTimeout(() => {
        this.setState({
          changingUpvote: false
        })
      }, 1000)
    } else {
      this.setState({
        changingUpvote: false
      })
    }
  }

  toggleFavour = async () => {
    const { gameInfo: { id } } = this.state;
    const { client } = this.context
    await client._mutate({
      mutation: TOGGLE_GAME_FAVOUR,
      variables: {
        input: {
          gameID: id
        }
      }
    })
    this.updateGame()
  }

  toggleReadMore = () => {
    const { readMore } = this.state;
    this.setState({
      readMore: !!(!readMore)
    })
  }

  setError = async (type) => {
    const { showGlobalMessage, i18nMsg, client, allowUnityError, cancelGame } = this.context
    const { gameInfo } = this.state
    type === 'timeout' && showGlobalMessage({
      content: i18nMsg['START_GAME_TIMEOUT'],
      type: 'error'
    })
    type === 'download' && !allowUnityError && showGlobalMessage({
      content: i18nMsg['GAME_DOWNLOAD_FAILED'],
      type: 'error'
    })
    type === 'busy' && !allowUnityError && showGlobalMessage({
      content: i18nMsg['GAME_LOADING_BUSY'],
      type: 'error'
    })
    type === 'join' && !allowUnityError && showGlobalMessage({
      content: i18nMsg['START_GAME_FAILED'],
      type: 'error'
    })
    cancelGame(gameInfo)
    type === 'start' && this.setState({ allowUnityError: false })
    const { teamInfoSubscription, _updateState } = this.context;
    teamInfoSubscription._reset()
    teamInfoSubscription._unsubscribe()
    // 调用leave game
    await client._mutate({
      mutation: LEAVE_GAME,
      variables: {
        input: {
          gameToken: ''
        }
      }
    })
    const clearTimer = new CustomEvent('clear timer');
    document.dispatchEvent(clearTimer)
    console.log('直接离队,清空teamInfo')
    _updateState({ teamInfo: {}, gameStatus: GAME_ERROR })
  }

  startGame = async (gameInfo) => {
    const { client, teamInfoSubscription, _updateState, gameStatus, version, prepareGame, cancelGame } = this.context
    const { gameDownloadingStatus } = this.state
    _updateState({ gameStatus: GAME_LOADING })
    const gameID = gameInfo.id;
    this.setState({ allowUnityError: true })
    this.hideTeamList();
    if (gameStatus === GAME_ERROR) {
      console.log('错误重启')
      try {
        const teamInfoRes = await teamInfoSubscription._query()
        teamInfoSubscription._reset();
        const teamInfo = _getIn(teamInfoRes, 'data', 'teamInfo')
        if (_getIn(teamInfo, 'roomInfo') && _getIn(teamInfo, 'state') === TEAM_GAME_PLAYING) {
          console.log('游戏正在进行中', gameInfo)
          prepareGame({ ...gameInfo, landscape: false })
          return
        }
      } catch (err) {
        this.setError();
        return
      }
      console.log('没有roominfo,走正常开始游戏流程')
    }
    console.log('gameDownloadingStatus', gameDownloadingStatus)
    console.log('待准备游戏信息', gameInfo)
    prepareGame({ ...gameInfo, landscape: false })
    const playGameRes = await client._mutate({
      mutation: PLAY_TEAM_GAME,
      variables: {
        input: {
          gameID,
          clientVersion: version
        }
      },
      passCondition: ['data', 'playTeamGame'],
      errorCode: 'START_GAME_FAILED'
    })
    if (playGameRes) {
      console.log('开始游戏中...')
      teamInfoSubscription._subscribe()
    } else {
      cancelGame(gameInfo)
      this.setError('start')
      _updateState({ gameStatus: GAME_ERROR })
    }

    client.mutate({
      mutation: TRACK_CLIENT,
      variables: {
        input: {
          trackKey: "webStartGame",
        }
      }
    }).then((dt) => {
      console.log(`[Davinci info]:`, dt);
    }).catch((e) => {
      console.log(`[Davinci info]:`, e)
    })
  }

  leaveGame = async () => {
    const { leaveGame } = this.context;
    console.log('收到unity的leave game')
    this.setState({
      gameDownloadingStatus: ''
    })
    leaveGame();
  }

  fetchData = () => {
    this.initDetailData();
    this.fetchComment()
  }

  fetchComment = async (skipLen, limitLen) => {
    const { pageSize, commentList, commentLoading, commentCount, id: gameID } = this.state
    const { client } = this.context
    const {
      match: {
        params: {
          id
        }
      }
    } = this.props;
    let skip = commentList.length || 0, limit = pageSize
    if (skipLen !== undefined && limitLen !== undefined) {
      skip = skipLen;
      limit = limitLen
    }
    if (id !== gameID) {
      skip = 0;
    }
    if ((commentList.length === commentCount || commentLoading) && limitLen === undefined && id === gameID) {
      return
    }
    this.setState({
      commentLoading: true
    })
    const commentRes = await client._query({
      query: GET_GAME_COMMENT,
      variables: {
        id,
        skipLen: skip,
        limitLen: limit
      },
      fetchPolicy: 'no-cache'
    })
    this.setState({
      commentLoading: false
    })

    const data = _getIn(commentRes, 'data', 'playerHubGameCommentList')
    if (data) {
      const { list, totalCount } = data;
      this.setState({
        commentCount: totalCount,
        commentList: skip === 0 ? list || [] : commentList.concat(list || []),
      })
    } else {
      this.setState({
        commentCount: 0,
        commentList: []
      })
    }
  }

  handleUserLeave = async (gameInfo, callback) => {
    const { _updateState, teamInfo, leaveGame, cancelGame } = this.context;
    const { intl } = this.props;
    const currentGameId = _getIn(gameInfo, 'id')
    const clearTimer = new CustomEvent('clear timer');
    if (currentGameId && _getIn(teamInfo, 'gameInfo', 'gameID') === currentGameId) {
      _updateState({
        basicModalOptions: {
          okText: (intl.messages['game.confirm'] || "Confirm"),
          onConfirm: () => {
            document.dispatchEvent(clearTimer)
            if (callback) {
              leaveGame(true, gameInfo)
              callback()
              return
            }
            leaveGame(false, gameInfo)
          },
          cancelText: (intl.messages['game.cancel'] || "Cancel"),
          description: (intl.messages['game.confirm_leave'] || `Confirm to leave?`),
        }
      })
    } else {
      if (callback) {
        callback();
        return
      }
      cancelGame(gameInfo)
      document.dispatchEvent(clearTimer)
      this.setState({ gameInfo: false })
      history.push('/home/games')
    }
  }

  mapLengthClass = (name) => {
    if (!name) {
      return ''
    }
    const map = {
      'title-size-15': [12, 20],
      'title-size-19': [20, 24],
      'title-size-24': [24, 30],
      'title-size-24 title-size-30': [30, Infinity]
    }
    const length = charCodeLen(name)
    let mappedClass = ''
    Object.keys(map).forEach(item => {
      if (length > map[item][0] && length <= map[item][1]) {
        mappedClass = item
      }
    })

    return mappedClass
  }

  confirmCancel = (gameInfo) => {
    const { leaveGame, cancelGame } = this.context;
    leaveGame(true)
    console.log('中断下载', gameInfo)
    cancelGame(gameInfo)
  }

  showUser = async (id) => {
    const { client } = this.context
    const userRes = await client._query({
      query: QUERY_USER_INFO,
      variables: {
        queryUserID: id
      },
      fetchPolicy: 'no-cache',
      passCondition: ['data']
    })
    if (userRes) {
      const { queryUserInfo, userPlayedGameList, queryFriendsCount } = userRes;
      let avatarGender = 0
      try {
        avatarGender = _getIn(JSON.parse(queryUserInfo.avatarJSON), 'suitsDatas', 0, 'gender')
      } catch (err) {
        console.log('err', err)
      }
      this.setState({
        displayUser: {
          ...queryUserInfo,
          avatarGender,
          playedList: userPlayedGameList,
          friendsCount: queryFriendsCount
        }
      })
    }
  }

  handleScroll = (e) => {
    if (this.detailBody) {
      const { topBarHeight } = this.state;
      const { top, bottom } = this.detailBody.getBoundingClientRect();
      const body = document.getElementsByTagName("body")[0]
      // console.log('bottom', bottom)
      // console.log('scrollY', window.pageYOffset)
      // console.log('scrollTop', document.body.scrollTop)
      // console.log('scrollHeight', document.body.scrollHeight)
      // console.log('clientHeight', document.body.clientHeight)
      if (bottom <= (body.clientHeight + 2)) {
        this.fetchComment()
      }
      let enterRatio = 0;
      this.setState({ topBarActive: top < (topBarHeight - 10) })
      if (top < topBarHeight) {
        enterRatio = top <= 0 ? 1 : 1 - top / topBarHeight;
      }
      this.topControl.style.background = `rgba(255,255,255,${enterRatio})`
    }
  }

  componentWillUnmount() {
    document.removeEventListener('game error', this.handleGameError)
    window.removeEventListener('scroll', this.handleScroll)
    this.setState({ gameInfo: false })
  }

  componentDidUpdate(state) {
    const { path } = this.state;
    const { history: { location: { pathname, search } } } = state;
    const {
      match: {
        params: {
          id
        }
      }
    } = this.props;
    if ((pathname + search) !== path) {
      this.fetchData();
      this.setState({
        topBarActive: false,
        path: pathname + search,
        id
      })
    }
  }

  async handleComment(e) {
    const { commentInput, gameInfo: { gameID }, commenting, commentList } = this.state
    const { showGlobalMessage, i18nMsg, client } = this.context
    e.persist();
    const keyCode = e.keyCode || e.which;
    if (keyCode === 13) {
      const trimedComment = commentInput.trim()
      if (trimedComment.length < 1) {
        return
      }
      if (trimedComment.length > 140) {
        showGlobalMessage({
          content: i18nMsg["game.comment_long"],
          type: 'error'
        })
        return
      }
      console.log('提交评论', trimedComment)
      if (commenting) {
        console.log('正在评论')
        return
      }
      this.setState({
        commenting: true
      })
      const commentRes = await client._mutate({
        mutation: MAKE_COMMENT,
        variables: {
          gameID,
          comment: trimedComment
        },
        passCondition: ['data'],
        passCode: 'game.comment_success'
      })
      this.setState({
        commenting: false
      })
      if (commentRes) {
        this.setState({
          commentInput: ''
        })
        this.inputComment.blur();
        this.fetchComment(0, commentList.length + 1)
      }
      this.updateGame();
    }
  }

  judgeMoreContent() {
    const { commentCount, commentLoading, commentList } = this.state;
    const { i18nMsg } = this.context;
    if (commentLoading) {
      return i18nMsg['game.loading']
    }
    if (commentCount === 0) {
      return i18nMsg['game.comment_nomore']
    }
    if (commentCount && commentList.length < commentCount) {
      return i18nMsg['game.comment_more']
    } else {
      return i18nMsg['game.comment_nomore']
    }
  }

  deleteComment(id) {
    const { commentList } = this.state
    const { showGlobalModal, i18nMsg, client } = this.context;
    showGlobalModal({
      content: i18nMsg['game.comment_delete'],
      successCb: async () => {
        const deleteRes = await client._mutate({
          mutation: DELETE_COMMENT,
          variables: {
            commentID: id
          },
          passCode: 'game.comment_delete_success',
          passCondition: ['data']
        })
        if (deleteRes) {
          this.fetchComment(0, commentList.length)
        }
      },
    })
  }

  render() {
    const webpackContext = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    const { intl } = this.props;

    return (
      <PlatformContext.Consumer>
        {({ teamInfo, userInfo, gameStatus, inGameJoinTeamInfo, isWindows, joinTeam }) => {
          const { gameInfo, displayUser, loading, animation, commentInput, gameDownloadingStatus, loadingPercent, topBarHeight, commentList, topBarActive, hasMoreContent, readMore, previewImg } = this.state;
          const teamInCurrentGame = _getIn(teamInfo, 'gameInfo', 'gameID') ? _getIn(teamInfo, 'gameInfo', 'gameID') === gameInfo.id : true
          const isLeader = _getIn(teamInfo, 'members', 'length') ? _getIn(teamInfo, 'leaderID') === _getIn(userInfo, 'userID') : true
          const isTeamMember = _getIn(teamInfo, 'members', 'length') ? _getIn(teamInfo, 'leaderID') !== _getIn(userInfo, 'userID') : false
          // 排序处理，将队长置顶
          if (_getIn(teamInfo, 'members', 'length') > 1) {
            const members = teamInfo.members
            const leaderID = _getIn(teamInfo, 'leaderID')
            const leaderIdx = members.findIndex(item => {
              return item.userID === leaderID
            })
            const leader = members.splice(leaderIdx, 1)[0]
            members.unshift(leader)
            teamInfo.members = members
          }
          const teamList = _getIn(teamInfo, 'members', 'length') > 1 ? teamInfo.members : []
          // 判断游戏加载
          const judgeGameLoading = () => {
            if (!teamInCurrentGame) {
              return false
            }
            if (gameStatus === GAME_LOADING) {
              if (isLeader) {
                return ([TEAM_GAME_CREATING, TEAM_GAME_PLAYING].indexOf(teamInfo.state) > -1)
              } else {
                return _getIn(teamInfo, 'roomInfo')
              }
            } else {
              return false
            }
          }
          // 判断开始按钮显示
          const judgeStatus = () => {
            const status = intl.messages['game.start']
            const isMember = _getIn(teamInfo, 'members', 'length') > 1 && _getIn(userInfo, 'userID') !== _getIn(teamInfo, 'leaderID')
            if (teamInCurrentGame) {
              if (_getIn(teamInfo, 'state') === TEAM_GAME_PLAYING && gameDownloadingStatus === 'success') {
                return intl.messages['game.started']
              }
              if (judgeGameLoading() || gameStatus === GAME_LOADING) {
                if (isMember) {
                  if ([TEAM_GAME_PLAYING, TEAM_GAME_CREATING].indexOf(_getIn(teamInfo, 'state')) > -1) {
                    return intl.messages[gameDownloadingStatus === 'success' && _getIn(teamInfo, 'state') === TEAM_GAME_PLAYING ? 'game.started' : 'game.starting']
                  } else {
                    return intl.messages['game.wait_leader']
                  }
                } else {
                  return intl.messages['game.starting']
                }
              }
              // 针对组队队员的逻辑
              if (isMember) {
                if (_getIn(teamInfo, 'state') === TEAM_GAME_PLAYING) {
                  if (gameDownloadingStatus === 'success') {
                    return intl.messages['game.started']
                  }
                  return intl.messages['game.starting']
                }
                return intl.messages['game.wait_leader']
              }
            } else if (history.location.search === '?type=change') {
              return intl.messages['game.starting']
            } else if (history.location.search === '?type=join') {
              return intl.messages['game.wait_leader']
            }
            return status
          }
          // 判断是否可邀请
          const judgeInvitable = () => {
            const memberCount = _getIn(teamInfo, 'members', 'length') || 1
            const pendingCount = _getIn(teamInfo, 'pendingMembers', 'length') || 0
            let invitable = true
            invitable = !judgeGameLoading();
            if ((memberCount + pendingCount) >= _getIn(gameInfo, 'maxPlayers')) {
              invitable = false
            }
            return invitable
          }
          // 判断全屏加载遮罩
          const judgeShowGameLoading = () => {
            if (!teamInCurrentGame || gameStatus === GAME_ERROR || gameStatus === '') {
              return false
            }
            if (['loading', 'success', 'downloaded', 'prepared'].indexOf(gameDownloadingStatus) > -1) {
              if (inGameJoinTeamInfo) {
                return true
              }
              if (!isLeader) {
                return Boolean(_getIn(teamInfo, 'roomInfo')) && ['success', 'downloaded', 'prepared'].indexOf(gameDownloadingStatus) > -1
              } else {
                return _getIn(teamInfo, 'state') === TEAM_GAME_PLAYING || history.location.search === '?type=change'
              }
            } else {
              return false
            }
          }
          // 判断阻止点击遮罩
          const judgePreventMaskShow = () => {
            return isTeamMember ?
              [TEAM_GAME_PLAYING, TEAM_GAME_CREATING].indexOf(_getIn(teamInfo, 'state')) > -1
              && gameStatus === GAME_LOADING
              : gameStatus === GAME_LOADING
          }
          return <div className="game-detail-wrapper">
            {!gameInfo && !loading && <div>
              <div className="top-control">
                <div className="control" >
                  <img
                    src={getImg('back-active.png')}
                    onClick={() => this.handleUserLeave(gameInfo)}
                    alt="" />
                </div>
              </div>
              <div className="game-error" onClick={() => {
                this.fetchData();
                const isTeamMember = history.location.search === '?type=join'
                if (isTeamMember) {
                  console.log('详情页')
                  joinTeam(gameInfo.id)
                }
              }}>
                {intl.messages['game.fetch_err']}
              </div>
            </div>}
            {gameInfo && !loading && <GameContext.Provider value={{ gameInfo, teamInfo }}>

              {judgePreventMaskShow() && <div className="prevent-mask" onClick={e => e.preventDefault()} />}
              <div className="top-control" ref={el => this.topControl = el} style={{ height: `${topBarHeight}px` }}>
                <div className="control" >
                  {!judgeGameLoading() && <img
                    src={getImg(topBarActive ? 'back-active.png' : 'back.png')}
                    onClick={() => this.handleUserLeave(gameInfo)}
                    alt="" />}
                </div>
                <div className="control">
                  <img className={!gameInfo.favorited ? 'favour active' : 'favour'} onClick={() => this.toggleFavour()} src={getImg(topBarActive ? 'favour-active.png' : 'favour.png')} alt="" />
                  <img className={gameInfo.favorited ? 'favour active' : 'favour'} onClick={() => this.toggleFavour()} src={getImg(topBarActive ? 'favoured-active.png' : 'favoured.png')} alt="" />
                </div>
              </div>
              <Mask visible={displayUser} onClose={() => this.setState({ displayUser: false })}>
                <UserCard
                  handleUserLeave={this.handleUserLeave}
                  gameID={gameInfo.id}
                  gameInfo={gameInfo}
                  detail={displayUser}
                  onclose={() => this.setState({ displayUser: false })}
                />
              </Mask>
              {
                judgeShowGameLoading() ?
                  <Mask visible closable={false} transform={isWindows ? false : '90'} bgSrc={gameInfo.coverURL}>
                    <div className="game-loading">
                      <h1 className={`loading-title ${this.mapLengthClass(gameInfo.name)}`} >{gameInfo.name}
                      </h1>
                      {/* 以下判断为：点击start后进入加载页，加载页分为下载和加载游戏两步 */}
                      {
                        ['success', 'downloaded', 'prepared'].indexOf(gameDownloadingStatus) > -1 ? (
                          // 加载游戏
                          <div className="loading-load">
                            <img alt='load' src={images['loading.png']} />
                            <p className="loading-p">
                              {
                                intl.messages['game.loading'] || 'Loading......'
                              }
                            </p>
                          </div>
                        ) : (
                            // 下载
                            <div className="loading-progress">
                              <p className="loading-p">{intl.messages['game.downloading'] || 'Downloading'} {loadingPercent}%</p>
                              <div className="progress-bar">
                                <div className="progress" style={{ width: `${loadingPercent}%` }}></div>
                              </div>
                              <p className="loading-text">
                                {
                                  intl.messages['game.first_time_loading'] || 'First-time setup may take a little while'
                                }
                              </p>
                            </div>
                          )
                      }
                      {/* <div className="cancel-btn" onClick={() => this.confirmCancel(gameInfo)}>中断下载</div> */}
                    </div>
                  </Mask> : <Fragment>
                    <div className="game-image">
                      {gameInfo.publicStatus === 'DEVELOPING' && <div className="test-game">{intl.messages['game.testgame']}</div>}
                      <img className="bg" src={gameInfo.publicStatus === 'DEVELOPING' ? getImg('icon_workshop.png') : gameInfo.coverURL} alt="" />
                    </div>
                    <div ref={el => this.detailBody = el} className={animation ? "detail-body" : "detail-body hide"} >
                      {_getIn(teamList, 'length') > 0 && <div className="team-list">
                        {
                          teamList.map((item, index) => {
                            return index < 4 && (
                              <div key={item.userID}
                                className={`avatar ${item.userID === teamInfo.leaderID && 'leader'}`}
                                onClick={() => this.showCard(item)}
                                style={{ cursor: 'pointer' }}
                              >
                                <img className="icon" src={item.iconURL || images['Icon_head.png']} alt="" />
                              </div>
                            )
                          })
                        }
                        {
                          _getIn(teamList, 'length') > 4 && <div className="avatar">
                            <img className="icon" src={_getIn(teamList, 4, 'iconURL') || images['Icon_head.png']} alt="" />
                            {/* 模糊显示剩余人数 */}
                            <span className="plus-icon"
                              onClick={this.showTeamList}>
                              + {teamList.length - 4}
                            </span>
                          </div>
                        }
                        {
                          _getIn(teamInfo, 'pendingMembers', 'length') > 0 && (_getIn(teamInfo, 'pendingMembers', 'length') < 4 ?
                            teamInfo.pendingMembers.map(pending => {
                              return (
                                <div className="avatar" key={pending.userID}>
                                  <img className="icon" src={pending.iconURL || images['Icon_head.png']} alt="" />
                                  <img className="plus-icon-spin" src={images['loading.svg']} alt="" />
                                </div>
                              )
                            }) : <div>
                              <div className="avatar">
                                <img className="icon" src={_getIn(teamInfo, 'pendingMembers', 0, 'iconURL') || images['Icon_head.png']} alt="" />
                                <img className="plus-icon-spin" src={images['loading.svg']} alt="" />
                                <span className="plus-icon"
                                  onClick={this.showTeamList}>
                                  + {_getIn(teamInfo, 'pendingMembers', 'length')}
                                </span>
                              </div>
                            </div>)
                        }
                      </div>}
                      <div className='btn-group'>
                        <button
                          disabled={judgeGameLoading() || gameStatus === GAME_LOADING}
                          className="start-btn"
                          onClick={() => this.startGame(gameInfo)}
                        >
                          {
                            (judgeGameLoading() || gameStatus === GAME_LOADING) && <img src={images['loading.png']} alt="img" />
                          }
                          <span>{judgeStatus()}</span>
                        </button>
                        {judgeInvitable && <button className="invite-btn" onClick={() => this.showDrawer(gameInfo)}>
                          {intl.messages['game.invite.friend']}
                        </button>}
                      </div>
                      <div className="break"></div>
                      <div className="title-bar">
                        <div className="body-title">{gameInfo.name}</div>
                        <div className="upvote" onClick={() => this.toggleUpvote()}>
                          <div>
                            <img
                              className={gameInfo.voteType === 'UPVOTE' ? 'upvoted' : ""}
                              src={gameInfo.voteType === 'UPVOTE'
                                ? getImg('upvote-active.png')
                                : getImg('upvote.png')} alt="" />
                          </div>
                          <div>{gameInfo.upvotes}</div>
                        </div>
                      </div>
                      <div className="scroll">
                        <PreviewList imgList={gameInfo.thumbnailURLs} />
                      </div>
                      <div className="stat-bar">
                        <div className="icon">
                          <img src={getImg('player-count.png')} alt="" />
                          {`${gameInfo.minPlayers}-${gameInfo.maxPlayers}`}
                        </div>
                        <div className="icon">
                          <img src={getImg('popularity.png')} alt="" />
                          {gameInfo.heatValue}
                        </div>
                        <div className="icon">
                          <img src={getImg('favour-gary.png')} alt="" />
                          {gameInfo.favorites}
                        </div>
                        <div className="icon">
                          <img src={getImg('update-time.png')} alt="" />
                          {dateFormat('yyyy / MM / dd', new Date(gameInfo.lastPublishTime))}
                        </div>
                      </div>
                      <div className="intro">
                        <div className="body-title">{intl.messages['game.intro']}</div>
                        <div className={hasMoreContent ? readMore ? "transition" : "has-more intro-content transition" : "intro-content transition"} ref={el => this.content = el}>{gameInfo.description}</div>
                        {hasMoreContent && <div className="readmore" onClick={() => this.toggleReadMore()}>{readMore ? intl.messages['game.retract'] : intl.messages['game.readmore']}</div>}
                        <div className="hidden-content" ref={el => this.hiddenContent = el}>{gameInfo.description}</div>
                      </div>
                      <div className="break"></div>
                      <div className="comment">
                        <div className="body-title">{intl.messages['game.reviews']}</div>
                        <div className="comment-block">
                          <div className="avatar" style={{ cursor: 'pointer' }} onClick={() => this.showUser(userInfo.userID)}>
                            <img src={userInfo.iconURL || images['Icon_head.png']} alt="" className="icon"></img>
                          </div>
                          <input className="comment-input"
                            ref={el => this.inputComment = el}
                            value={commentInput}
                            onInput={(e) => { this.setState({ commentInput: e.target.value }) }}
                            onChange={(e) => { this.setState({ commentInput: e.target.value }) }}
                            onKeyDown={(e) => this.handleComment(e)}
                            placeholder={intl.messages['game.saysth']}
                          />
                        </div>
                        {
                          commentList.map(item => {
                            return <div className="comment-block" key={item.id + item.timestamp}>
                              <div className="avatar" style={{ cursor: 'pointer' }} onClick={() => this.showUser(item.commentatorID)}>
                                <Image src={item.commentatorIconURL || images['Icon_head.png']} alt="" className="icon" />
                              </div>
                              <div className="comment-right">
                                <div className="top">
                                  <div className="name">{item.commentatorName}</div>
                                  {item.commentatorID === userInfo.userID
                                    && <img className="del" src={getImg('delete.png')} alt="" onClick={() => { this.deleteComment(item.id) }} />}
                                </div>
                                <div>
                                  {item.comment}
                                </div>
                                <div className="date">{judgeTimeGap(item.timestamp)}</div>
                                <div className="break"></div>
                              </div>
                            </div>
                          })
                        }
                        {
                          <div className="more-block">
                            {this.judgeMoreContent()}
                          </div>
                        }
                      </div>
                    </div>
                  </Fragment>
              }
              <MyFriendCard visible={this.state.visibleDrawer} onClose={this.onClose} />
              <Drawer
                title={<div><img src={images['Icon_CirOB.png']} alt='' /><span>Team List</span></div>}
                placement="bottom"
                closable={false}
                onClose={this.hideTeamList}
                visible={this.state.teamList}
                className="team-drawerBottom"
                drawerStyle={{
                  height: '35vh',
                  width: '94%',
                  marginLeft: '3%',
                  backgroundColor: '#eaf3f6',
                  borderTopLeftRadius: '15px',
                  borderTopRightRadius: '15px',
                  animation: 'springHeightAnimation .5s linear'
                }}
              >
                <div className="invite-headimg">
                  {
                    _getIn(teamInfo, 'members') && teamInfo.members.map((item, idx) => {
                      return (
                        <div key={item.userID} className={`head-bg-image ${item.userID === teamInfo.leaderID && 'isTeam'}`}>
                          <img className="user-avatar" src={item.iconURL || images['Icon_head.png']}
                            alt="">
                          </img>
                        </div>
                      )
                    })
                  }
                  {
                    _getIn(teamInfo, 'pendingMembers') && teamInfo.pendingMembers.map(pending => {
                      return (
                        <div className="head-bg-image"
                          key={pending.userID}>
                          <img className="user-avatar" src={pending.iconURL || images['Icon_head.png']}
                            alt="">
                          </img>
                          <img className="plus-icon-spin" src={images['loading.png']} alt="" />
                        </div>
                      )
                    })
                  }
                </div>
              </Drawer>
            </GameContext.Provider >}
          </div>
        }}
      </PlatformContext.Consumer >
    )
  }
}

export default injectIntl(GameDetail);
