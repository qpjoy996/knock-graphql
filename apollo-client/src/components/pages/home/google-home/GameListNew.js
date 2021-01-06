import React, { Fragment, useImerativeHandle } from 'react';
import { Tabs } from 'antd';
import { Query, withApollo, Mutation } from 'react-apollo';
import { withRouter, Link } from 'react-router-guard';
import gql from 'graphql-tag';
import { GET_GAME_LIST, ENTER_START_GAMEPAGE, QUERY_MYSELF, TRACK_CLIENT } from "apollo/graphql/gql";
import { importAll, errorHandler, _navigate, _getIn, charCodeLen, dateFormat, uniqueArray, setStateAsync } from "utils";
import { PlatformContext } from "states/context/PlatformContext";
import { PUBLIC_URL } from 'states/APP_STATE';
import MescrollList from 'components/partial/scroll/MescrollList';
import GameCard from 'components/partial/card/GameCard'
import { unityJSON, unityListen } from "utils/lib/unity";
import { GraphQLEnumType } from 'graphql';
import GameListBanner from 'components/partial/card/GameListBanner'
import ListDetailContext from '@/states/context/ListDetailContext'
import { injectIntl } from "react-intl";

const { TabPane } = Tabs;

const friendshipState = new GraphQLEnumType({
  name: "FriendshipState",
  values: {
    STRANGER: {
      value: 0
    },
    FOLLOWING: {
      value: 1
    },
    FOLLOWER: {
      value: 2
    },
    FRIEND: {
      value: 3
    }
  }
})
const userStatus = new GraphQLEnumType({
  name: "UserStatus",
  values: {
    OFFLINE: {
      value: 0
    },
    ONLINE: {
      value: 1
    },
    PLAYING: {
      value: 2
    }
  }
})
const BannerType = new GraphQLEnumType({
  name: "BannerType",
  values: {
    BigBanner: {
      value: 0
    },
    SmallBanner: {
      value: 1
    }
  }
})

// 好友数量
const QUERY_FRIEND_COUNT = gql`
  query queryFriendsCount($userID: String, $typ: FriendshipState!,$status:UserStatus!, $status1: UserStatus,$status2: UserStatus) {
    onlineCount: queryFriendsCount(userID: $userID, typ: $typ, status:$status)
    offlineCount: queryFriendsCount(userID: $userID, typ: $typ, status:$status1)
    playingCount: queryFriendsCount(userID: $userID, typ: $typ, status:$status2)
  }
`;
// 最后玩的游戏列表
const USERPLAYED_GAME_LIST = gql`
 query UserPlayedGameList($userID:String,$skipLen:Int!,$limitLen:Int!){
      userPlayedGameList(userID:$userID,skipLen:$skipLen,limitLen:$limitLen){
        gameID
        name
        iconURL
        coverURL
        thumbnailURLs
        heatValue
        timestamp
      }
    }
`;
// banner
const BANNER_LIST = gql`
  query BannerList($bannerType:BannerType,$bannerType1:BannerType){
    bigBanner:bannerList(bannerType:$bannerType) {
      id
      title
      type
      thumbnailURLs
      link {
        bannerID
        url
        type
        gameID
      }
    }
    smallBanner:bannerList(bannerType:$bannerType1) {
      id
      title
      type
      thumbnailURLs
      link {
        bannerID
        url
        type
        gameID
      }
    }
  }
`

// 默认时间最新、推荐游戏列表
const PLAYER_HUB_GAME_LIST = gql`
query playerHubGameList($input:PlayerHubGameListInput!){
    playerHubGameList(input:$input) {
      totalCount
      list {
        id
        name
        iconURL
        coverURL
        thumbnailURLs
        upvote
        downvote
        heatValue
        minPlayers
        maxPlayers
        publicStatus
        timestamp
      }
    }
  }
`;

//Current Players游戏列表
const ONLINE_GAME_LIST = gql`
query onlineGameList($input:OnlineGameListInput!){
  onlineGameList(input:$input) {
    list{
      id
      name
      iconURL
      totalPlaying
    }
    totalCount
  }
}
`
//banner点击
const TRACK_BANNER = gql`
  mutation trackBanner($input:TrackBannerInput!){
    trackBanner(input:$input){
      code
    }
  }
`

//点击问卷显示奖励
const CLAIM_AWARD = gql`
  mutation claimAward($input:ClaimAwardInput!){
    claimAward(input:$input){
      success
      rewardList{
        avatar{
          ID
          Type
          TimeLimitUnix
          TimeSec
        }
      }
    }
  }
`

const USER_FAVORITED_GAMELIST = gql`
  query userFavoritedGameList($input:UserFavoritedGameListInput!){
    userFavoritedGameList(input:$input){
      list{
        gameID 
        name 
        iconURL 
        thumbnailURLs
        heatValue
        timestamp 
      }
    }
  }
`

let limitLen = 6;
let timeoutVal;


const HomeList = (props) => {
  const webpackContext = require.context('assets/img/home', false, /\.(png|jpe?g|svg)$/);
  const images = importAll(webpackContext);
  const { lastPlayGame, getGameDetail, gamePlayKey, lastplayedRefresh,
    bannerLists, homeListBanner, homeList, getQueryWard, favoriteList, onChangeGamePlayTabs,
    getBannerClick, intl } = props;
  const favoriteLen = favoriteList && favoriteList.list && favoriteList.list.length > 0;
  const lastplayLen = lastPlayGame && lastPlayGame.length > 0;

  const LastPlayed = ({ item }) => {
    return (
      <ListDetailContext.Consumer>
        {({ triggerTrasition }) => (
          <div className="game-list-top" >
            <div className="list_top_img"
              style={{
                backgroundImage: `url(${item.thumbnailURLs && item.thumbnailURLs[0] ?
                  item.thumbnailURLs[0] : images['list_game.png']})`
              }}
              onClick={e => { triggerTrasition(item, e) }}
            ></div>
            <div className="top-detail">
              <p>{item.name}</p>
              <div className="card-text-count">
                <img className="text-img" src={images['fire-fill.svg']} alt='' />
                <span className="text-span">{item.heatValue || 0}</span>
              </div>
            </div>
          </div>)}
      </ListDetailContext.Consumer>
    )
  }
  return (
    <div className="game-home-list" ref={homeListBanner}>
      <div className="game-header-icon"></div>
      <div className="list-images">
        <div className="list-bananer">
          <div className="contain" >
            {// 大banner
              bannerLists.bigBanner && bannerLists.bigBanner.length > 0 ? (
                <GameListBanner
                  bannerLists={bannerLists}
                  getBannerClick={getBannerClick}
                  getQueryWard={getQueryWard}
                  getGameDetail={getGameDetail}
                />
              ) : null
            }
          </div>
        </div>
        {// 小banner
          bannerLists.smallBanner && bannerLists.smallBanner.length > 0 ? (
            bannerLists.smallBanner.map((item, index) => {
              return (
                <Fragment key={item.id}>
                  {
                    index === 0 ? <img src={item.thumbnailURLs && item.thumbnailURLs[0] ?
                      item.thumbnailURLs[0] : images['header_list_game.png']} alt='icon' onClick={() => {
                        getBannerClick(item); unityJSON("showConversation");
                      }} /> : null
                  }
                </Fragment>
              )
            })
          ) : null
        }
      </div>
      <div ref={homeList} className="list-games" >
        {
          !favoriteLen && !lastplayLen ? null : (
            <>
              <div className="line-listgames"></div>
              <div className={`list-tab ${favoriteLen && lastplayLen ? '' : 'list-tab-active'}`}>
                {
                  favoriteLen ? (
                    <p className={!lastplayLen || gamePlayKey === "1" ? "active" : ""}
                      onClick={() => { onChangeGamePlayTabs("1") }}>{intl.messages['home.games.favorite']}</p>
                  ) : null}
                {
                  lastplayLen ? (
                    <p className={!favoriteLen || gamePlayKey === "2" ? "active" : ""}
                      onClick={() => { onChangeGamePlayTabs("2") }}>{intl.messages['home.games.last_play']}</p>
                  ) : null
                }
              </div>
              {
                lastplayedRefresh ? (
                  <div className="gameplay_tablist">
                    {
                      favoriteLen && (!lastplayLen || gamePlayKey === "1") ? (
                        favoriteList.list.map((item, index) => {
                          return (
                            <Fragment key={item.gameID + index}>
                              <LastPlayed item={item} />
                            </Fragment>
                          )
                        })
                      ) : null
                    }
                    {
                      lastplayLen && (!favoriteLen || gamePlayKey === "2") ? (
                        lastPlayGame.map((item, index) => {
                          return (
                            <Fragment key={item.gameID + index}>
                              {
                                index < 5 ? (<LastPlayed item={item} />) : null
                              }
                            </Fragment>
                          )
                        })
                      ) : null
                    }
                  </div>
                ) : null
              }

            </>
          )
        }
      </div>
    </div>
  )
}

let gameCardItemHeight, cardImg;


class GameListNew extends React.Component {
  static contextType = PlatformContext;
  constructor(props) {
    super(props)
    this.state = {
      isRefresh: true,
      // list中tab参数值
      listTabKey: '1',
      gamePlayKey: '1',
      timer: null,
      showIndex: 0,
      userInfo: null,
      lastPlayGame: [],
      friendsCount: 0,
      bannerLists: [],
      favoriteList: [],
      gameListAll: null,
      gamePlayhubOrOnlineList: null,
      loading: true,
      keyword: '',
      isWorkshop: false,
      errorMsg: null,
      lastplayedRefresh: true
    }
  }

  async componentDidMount () {
    const { client } = this.props;
    // this.videoAnimation();
    //气泡动画后3s消失
    let setAvatar = localStorage.getItem("setAvatar")
    if (!setAvatar && this.tipElement) {
      this.tipElement.addEventListener('animationend', function () {
        let tipElement = this;
        setTimeout(function () {
          tipElement.style.display = "none"
        }, 5000)
      }, false)
    }

    const that = this;
    unityListen('refreshAvatar', async function () {
      console.log('收到换装事件')
      await that.refreshAvatar();
    });
    await this.refreshAvatar();
    await this.getInfo();

    client.mutate({
      mutation: TRACK_CLIENT,
      variables: {
        input: {
          trackKey: "webEnterHomegames",
        }
      }
    }).then((dt) => {
      console.log(`[Davinci info]:`, dt);
    }).catch((e) => {
      console.log(`[Davinci info]:`, e)
    })
  }

  _getListGameHeight = () => {
    const { gamePlayhubOrOnlineList } = this.state
    let listHeight;
    let gameCard = this.gameCardRef;
    if (gameCard) {
      if (gameCard.children && gameCard.children.length > 0) {
        let gameCardItem = gameCard && gameCard.children[0]
        cardImg = gameCardItem.children[0].offsetWidth
        let childrens = gameCard.children;
        for (let i = 0; i < childrens.length; i++) {
          childrens[i].children[0].style.height = cardImg + "px"
        }
        gameCardItemHeight = gameCardItem.offsetHeight;
        if (gamePlayhubOrOnlineList) {
          listHeight = Math.ceil(childrens.length / 2) * gameCardItemHeight;
          gameCard.style.height = listHeight + 'px';
        }
        // console.log("===", childrens.length, gameCardItem, gameCardItemHeight, listHeight, childrens.length / 2);
      } else {
        gameCard.style.height = "100vh";
      }
    }
  }

  // 用户信息获取
  refreshAvatar = async () => {
    const {
      client, _fetchUser
    } = this.context;
    let myselfDT = await this.queryMyself();
    if (myselfDT.pass) {
      _fetchUser();
      let myInfo = myselfDT.data;
      this.setState({ userInfo: myInfo.userInfo })
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

  gameInfoList = async (query, variables) => {
    const { client } = this.props;

    return new Promise(async (resolve, reject) => {
      client.query({
        query: query,
        fetchPolicy: 'network-only',
        variables: variables
      }).then(async (dt) => {
        if (dt.data) {
          if (query === "PLAYER_HUB_GAME_LIST") {
            await setStateAsync({
              loading: false
            }, this)
          }
          return resolve({
            pass: true,
            msg: 'Query success.',
            data: dt.data
          })
        }
      }).catch(async (error) => {
        if (query === "PLAYER_HUB_GAME_LIST") {
          await setStateAsync({
            loading: true
          }, this)
        }
        return resolve({
          pass: false,
          msg: 'Query error.',
          error
        })
      })
    })
  }

  getGameInfoList = async (list, state) => {
    if (list.pass) {
      let data = list.data;
      if (data.playerHubGameList) {
        console.log('list', data.playerHubGameList)
        data.playerHubGameList.list.forEach(item => {
          // 缓存game cover
          if (item.coverURL) { new Image().src = item.coverURL }
        })
      }
      await setStateAsync({
        errorMsg: null,
        [state]: data
      }, this)
    } else if (list.error) {
      await setStateAsync({
        errorMsg: list.msg
      }, this)
      errorHandler({
        error: list.error
      })
    } else {
      console.log('data issue');
    }
  }

  getInfo = async () => {
    //workshop是否显示
    await this.getPlayerGameList("UNDERDEVELOPMENT", "DEFAULT", 0)

    // 查询好友数及在线数
    let friendsCountVariables = {
      userID: localStorage.getItem('USER_ID'),
      typ: "FRIEND",
      status: "ONLINE",
      status1: "OFFLINE",
      status2: "PLAYING"
    }
    let friendsCount = await this.gameInfoList(QUERY_FRIEND_COUNT, friendsCountVariables);
    await this.getGameInfoList(friendsCount, 'friendsCount');

    // 获取banner信息
    let bannerVariables = { bannerType: "BigBanner", bannerType1: "SmallBanner" }
    let bannerLists = await this.gameInfoList(BANNER_LIST, bannerVariables);
    await this.getGameInfoList(bannerLists, 'bannerLists');

    this.getLastPlayed();

    //推荐游戏列表
    await this.getPlayerGameList("ALLVISIBLE", "RECOMMEND", 0);
    await this.getGameListAllPlay();
    this._getListGameHeight()


  }

  getLastPlayed = async () => {
    // 获取收藏游戏
    let favoriteVariables = {
      input: {
        userID: localStorage.getItem('USER_ID'),
        skipLen: 0,
        limitLen: 10
      }
    }
    let favoriteLists = await this.gameInfoList(USER_FAVORITED_GAMELIST, favoriteVariables);
    await this.getGameInfoList(favoriteLists, 'favoriteList');

    // 最后玩的游戏
    let playeGameVariables = {
      userID: localStorage.getItem('USER_ID'),
      skipLen: 0,
      limitLen: 10
    }
    let playedGameList = await this.gameInfoList(USERPLAYED_GAME_LIST, playeGameVariables);
    await this.getGameInfoList(playedGameList, 'lastPlayGame');
  }

  getOnlineGameList = async (skipLen) => {
    // 当前玩的游戏
    let onlineGameVariables = { input: { skipLen: skipLen, limitLen: limitLen } }
    let onlineGameList = await this.gameInfoList(ONLINE_GAME_LIST, onlineGameVariables);
    await this.getGameInfoList(onlineGameList, 'gamePlayhubOrOnlineList');
  }

  getPlayerGameList = async (filter, sorter, skipLen, keyword) => {
    const { listTabKey } = this.state
    //默认时间最新、推荐游戏列表
    let inputValue;
    if (keyword) inputValue = { filter: filter, sorter: sorter, skipLen: skipLen, limitLen: limitLen, keyword: keyword }
    else inputValue = { filter: filter, sorter: sorter, skipLen: skipLen, limitLen: listTabKey === '1' && filter === "UNDERDEVELOPMENT" ? 1 : limitLen }
    let playerHubGameVariables = {
      input: inputValue
    }
    let playerHubGameList = await this.gameInfoList(PLAYER_HUB_GAME_LIST, playerHubGameVariables);
    if (listTabKey === '1' && filter === "UNDERDEVELOPMENT") {
      if (playerHubGameList.pass && playerHubGameList.data.playerHubGameList
        && playerHubGameList.data.playerHubGameList.totalCount > 0) {
        this.setState({ isWorkshop: true })
      }
    } else { await this.getGameInfoList(playerHubGameList, 'gamePlayhubOrOnlineList'); }
  }

  // banner点击
  getBannerClick = async (item) => {
    let variables = {
      input: { bannerID: item.id }
    }
    await this.gameInfoList(TRACK_BANNER, variables);
  }

  componentDidUpdate (nextProps, nextState) {
    // 不同对象共用一个mescroll的情况,重置刷新
    if (nextState.listTabKey != this.state.listTabKey) {
      this._getListGameHeight();
    }
  }

  //favorite
  onChangeGamePlayTabs = async (key) => {
    if (key != this.state.gamePlayKey) this._refreshLastplayed()
    await setStateAsync({
      gamePlayKey: key,
      // lastplayedRefresh:true
    }, this)
  }

  _refreshLastplayed = () => {
    this.setState({
      lastplayedRefresh: false
    }, () => {
      this.setState({
        lastplayedRefresh: true
      })
    })
  }

  onChangeTabs = async (key) => {
    // console.log("this==============", key);
    await setStateAsync({
      listTabKey: key,
      gameListAll: null,
      gamePlayhubOrOnlineList: null,
      keyword: '',
      errorMsg: null
    }, this)
    await this.getOnLoadMore(key, 0);
    //注:每页个数超过6个且页数为1时
    this._getListGameHeight()
  }


  getOnLoadMore = async (key, skipLen) => {
    if (key === "1") {
      await this.getPlayerGameList("ALLVISIBLE", "RECOMMEND", skipLen)
    } else if (key === "2") {
      await this.getPlayerGameList("ALLVISIBLE", "DEFAULT", skipLen)
    } else if (key === "3") {
      await this.getPlayerGameList("ALLVISIBLE", "HOTTEST", skipLen)
    } else if (key === "4") {
      await this.getPlayerGameList("UNDERDEVELOPMENT", "DEFAULT", skipLen)
    }
    await this.getGameListAllPlay()
  }

  getGameListAllPlay = async () => {
    const { gamePlayhubOrOnlineList, gameListAll, keyword } = this.state;
    // (listTabKey === "1" || listTabKey === '2' || listTabKey === '4') &&
    if (gamePlayhubOrOnlineList && gamePlayhubOrOnlineList.playerHubGameList) {
      if (gameListAll === null || keyword != '') {
        await setStateAsync({
          gameListAll: gamePlayhubOrOnlineList.playerHubGameList
        }, this)
      } else {
        let list = gameListAll && gameListAll.list;
        await setStateAsync({
          gameListAll: {
            list: [...list, ...gamePlayhubOrOnlineList.playerHubGameList.list],
            totalCount: gamePlayhubOrOnlineList.playerHubGameList.totalCount
          }
        }, this)
      }
    }
    // else if (listTabKey === '3' && gamePlayhubOrOnlineList && gamePlayhubOrOnlineList.onlineGameList) {
    //   if (gameListAll === null) {
    //     await setStateAsync({
    //       gameListAll: gamePlayhubOrOnlineList.onlineGameList
    //     }, this)
    //   } else {
    //     let list = gameListAll && gameListAll.list;
    //     await setStateAsync({
    //       gameListAll: {
    //         list: list.concat(gamePlayhubOrOnlineList.onlineGameList.list),
    //         totalCount: gamePlayhubOrOnlineList.onlineGameList.totalCount
    //       }
    //     }, this)
    //   }
    // }

  }

  // queryMyself
  queryMyself = async () => {
    const { client } = this.props;
    return new Promise(async (resolve, reject) => {
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
    })
  }

  componentWillUnmount () {
    clearTimeout(timeoutVal); //清除页面定时器，避免fetchMore is undifined
  }

  // 手机摇晃动画
  videoAnimation = () => {
    if (this.videoElement)
      this.videoElement.style.animation = "videoAnimation 2.5s linear infinite";
  }

  // 页面刷新
  _refreshPage = () => {
    this.setState({
      isRefresh: false,
    }, () => {
      this.setState({
        isRefresh: true
      });
    });
  }

  //换装 
  _rehandling = () => {
    localStorage.setItem("setAvatar", true);
    console.log("换装");
    unityJSON("setAvatar");
  }

  //好友列表
  _friendsOnline = () => {
    console.log("好友列表");
    unityJSON("showFriends");
  }

  // 调查问卷奖励
  // ShowNewAvatarItems
  // _showNewAvatarItems = () => {
  //   console.log("问卷奖励");
  //   unityJSON("showNewAvatarItems", {});
  // }

  getQueryWard = async (id) => {
    const { client } = this.props
    const claimAward = await client._mutate({
      mutation: CLAIM_AWARD,
      variables: {
        input: { bannerID: id + '' }
      },
      fetchPolicy: 'no-cache'
    })
    if (claimAward.data && claimAward.data.claimAward) {
      let award = claimAward.data.claimAward
      if (award.success) {
        console.log("TRYAWARD_QUESTION_NAIRE", award.rewardList[0].avatar);
        unityJSON("showNewAvatarItems", award.rewardList[0].avatar);
      }
    }
  }

  getGameDetail = (item, str, listTabKey, disableNavigation) => {
    console.log(item.id, listTabKey, str)
    const { client } = this.props
    let id, type = '';
    if (listTabKey && listTabKey === "4") { type = "/workshop" }
    if (str) id = item.gameID;
    else id = item.id
    this.sendIntoGame(id)
    if (!disableNavigation) {
      _navigate(`/home/games/${id}${type}`, 'homeGameDetail', {
        id: id,
        type: type
      })
    }
    client.mutate({
      mutation: TRACK_CLIENT,
      variables: {
        input: {
          trackKey: "webEnterGameDetail",
        }
      }
    }).then((dt) => {
      console.log(`[Davinci info]:`, dt);
    }).catch((e) => {
      console.log(`[Davinci info]:`, e)
    })
  }

  // 发送数据埋点（进入游戏id）
  sendIntoGame = (id) => {
    try {
      const { client } = this.context
      client.mutate({
        mutation: ENTER_START_GAMEPAGE,
        variables: {
          gameID: id
        },
      }).then(resp => {
        console.log('resp-sendIntoGame', resp)
      }).catch(err => {
        console.log('err-sendIntoGame', err)
      })
    } catch (err) {
      console.log('errcatch-sendIntoGame', err)
    }
  }

  onWorkshop = (e) => {
    this.setState({
      keyword: e.target.value
    }, async () => {
      await this.workshopSearch()
    })
  }

  workshopSearch = async () => {
    console.log("keyword=====", this.state.keyword);
    await this.getPlayerGameList("UNDERDEVELOPMENT", "DEFAULT", 0, this.state.keyword)
    await this.getGameListAllPlay()
  }

  showIMChat = () => {
    unityJSON("showIMChat", {});
  }

  render () {
    const webpackContext = require.context('assets/img/home', false, /\.(png|jpe?g|svg)$/);
    const webpackContextBasic = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    const basicImages = importAll(webpackContextBasic);
    const { listTabKey, isRefresh, showIndex, userInfo, lastPlayGame, friendsCount, keyword, isWorkshop, gamePlayKey,
      bannerLists, gameListAll, loading, errorMsg, favoriteList } = this.state;
    let setAvatar = localStorage.getItem("setAvatar")
    let friendsCounts = friendsCount.offlineCount + friendsCount.onlineCount + friendsCount.playingCount;
    let charlenNickname, gender;
    if (userInfo && userInfo.nickname) {
      if (userInfo.nickname) charlenNickname = charCodeLen(userInfo.nickname)
      if (userInfo.avatarJSON) gender = JSON.parse(userInfo.avatarJSON).suitsDatas[0].gender
    }
    let gameListAllD;
    if (gameListAll && gameListAll.list) { gameListAllD = gameListAll.list }
    // if (gameListAll && gameListAll.list) { gameListAllD = gameListAll.list }
    // console.log("gamePlayhubOrOnlineList++++++++++++++++", gameListAll);
    const { intl } = this.props;

    const tabList = [
      { key: '1', tab: intl.messages['home.games.recommend'] },
      { key: '2', tab: intl.messages['home.games.new_arrivals'] },
      { key: '3', tab: intl.messages['home.games.hottest'] },
      { key: '4', tab: intl.messages['home.games.workshop'] }
    ]
    return (
      <ListDetailContext.Consumer>
        {({ triggerTrasition }) => (
          <div className="game-home">
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: '1000',
              borderRadius: '50%',
              padding: '10px',
              backgroundColor: 'orange',
              cursor: 'pointer'
            }}
            onClick={() => this.showIMChat()}
            >
              <img className="game-video" src={basicImages['IM.png']} />
            </div>
            <div className="game-home-header"
            // style={{ backgroundImage: `url(${images['Pic_game01.png']})` }}
            >
              <div>
                {/* <video className="game-video" width="100%" autoPlay loop muted
                  poster={images['Bitmap.png']}
                  ref={el => this.videoElement = el}>
                  <source src={PUBLIC_URL + "/static/game_playhub.mp4"}
                    type="video/mp4" />
                  <p>Sorry, your browser doesn't support embedded videos.</p>
                </video> */}
                <img className="game-video" src={images['Bitmap.png']} />
              </div>
              <div className="header-content">
                <div className="header-friend" onClick={this._friendsOnline}>
                  {
                    userInfo && userInfo.nickname ?
                      (<span className={charlenNickname < 15 ? (charlenNickname < 10 ? "" : 'fontsize-10') : 'fontsize-15'}>
                        {userInfo.nickname}</span>)
                      : (<span>" "</span>)
                  }
                  {/* 是否有好友 */}
                  {
                    friendsCounts > 0 ? (
                      <p className="header-onlinefriends">
                        <span>{friendsCount.onlineCount} friends online</span>
                        <img src={images['icon_friend_url.svg']} alt="" />
                      </p>
                    ) : (
                        <p className="header-addfriends">
                          <img src={images['user-add-fill.svg']} alt="" />
                          <span>Add Friends</span>
                        </p>)
                  }
                </div>
                <div className="header-image" onClick={this._rehandling}>
                  <div className={`header-avatar-body ${userInfo && userInfo.avatarBodyURL != "" ? "avatar_noNull" : "avatar_isNull"}`}
                    style={{
                      backgroundImage: `url(${userInfo && userInfo.avatarBodyURL != "" ? userInfo.avatarBodyURL
                        : gender === 2 ? images['avatar_girl_body.png'] : images['avatar_body.png']})`,
                      // gender=2是女
                    }}
                  ></div>
                  {/* <img className="img-avatar-body" src={userInfo && userInfo.avatarBodyURL != "" ? userInfo.avatarBodyURL
                : gender === 2 ? images['avatar_girl_body.png'] : images['avatar_body.png']}
                alt='figure' /> */}
                  {
                    setAvatar ? null : (
                      <div className="header-clickchange"
                        style={{ backgroundImage: `url(${images['user_tip.png']})` }}
                        ref={el => this.tipElement = el}>
                        <span>Tap me to change appearance</span>
                      </div>
                    )
                  }
                </div>
                {/* 奖励按钮 */}
                {/* <div className="header-newrewards">
                <span></span>
                <span>New Rewards</span>
              </div> */}
              </div>
            </div>
            <MescrollList
              title={null}
              children={
                <div className="home-all" >
                  <HomeList
                    showIndex={showIndex}
                    bannerChange={this.bannerChange}
                    homeListBanner={el => this.homeListBanner = el}
                    homeList={el => this.homeList = el}
                    lastPlayGame={lastPlayGame && lastPlayGame.userPlayedGameList}
                    getGameDetail={this.getGameDetail}
                    bannerLists={bannerLists}
                    getQueryWard={this.getQueryWard}
                    getBannerClick={this.getBannerClick}
                    onChangeGamePlayTabs={this.onChangeGamePlayTabs}
                    gamePlayKey={gamePlayKey}
                    favoriteList={favoriteList && favoriteList.userFavoritedGameList}
                    lastplayedRefresh={this.state.lastplayedRefresh}
                    intl={intl}
                  />
                  <div className="line-listgames"></div>
                  <div id="navWarp">
                    <div id="navContent" className="list-tab">
                      {
                        tabList.map(item => {
                          return (
                            <Fragment key={item.key}>
                              {
                                item.key === '4' && !isWorkshop ? null : (
                                  <p className={listTabKey === item.key ? "active" : ""}
                                    onClick={() => { if (listTabKey != item.key) this.onChangeTabs(item.key) }}>{item.tab}</p>
                                )
                              }
                            </Fragment>
                          )
                        })
                      }
                    </div>
                  </div>
                  {
                    listTabKey === "4" ? (
                      <div className="work-shop">
                        <input type="text" placeholder="search game" onChange={this.onWorkshop} />
                        <img src={basicImages['Icon_search.svg']} alt="icon"
                        // onClick={this.workshopSearch}
                        />
                      </div>
                    ) : null
                  }
                  <div className="game-cards" id="upscrollWarp">
                    <div className="game-card" ref={el => this.gameCardRef = el}>
                      {
                        gameListAll ? (
                          gameListAll.list && gameListAll.list.length > 0 ? (
                            <GameCard listTabKey={listTabKey}
                              triggerTrasition={triggerTrasition}
                              gameList={gameListAll && gameListAll.list}
                              getGameDetail={this.getGameDetail} />
                          ) : (
                              <div style={{ margin: '0 auto' }}>
                                <div className="card-list-nothing" style={{ marginTop: '40px' }}>
                                  <div className="img" style={{ backgroundImage: `url(${basicImages['Pic_nothing_suit.png']})` }}></div>
                                  <p>{intl.messages['home.games.no_game']}</p>
                                </div>
                                {
                                  keyword != '' ? null : (
                                    <div className="lets-play-card-bottom-text">
                                      <span>{intl.messages['home.games.coming_soon']}</span>
                                    </div>
                                  )
                                }
                              </div>
                            )
                        ) : (
                            <>
                              {
                                errorMsg ? (
                                  <div style={{ margin: '0 auto' }}>
                                    <div className="card-list-nothing" style={{ marginTop: '40px' }}>
                                      <div className="img" style={{ backgroundImage: `url(${basicImages['Pic_nothing_suit.png']})` }}></div>
                                      <p>{intl.messages['home.games.no_game']}</p>
                                    </div>
                                    <div className="lets-play-card-bottom-text">
                                      <span>{errorMsg}</span>
                                    </div>
                                  </div>
                                ) : (
                                    <div className="data-refresh">
                                      <div className="loading"></div>
                                      <span>
                                        {intl.messages['home.games.loading']}
                                      </span>
                                    </div>
                                  )
                              }
                            </>
                          )
                      }
                    </div>
                  </div>
                </div>
              }
              noMoreData={intl.messages['home.games.coming_soon']}
              isrefresh={true} //下拉刷新
              loading={loading} //数据请求的加载状态
              curPageSize={gameListAllD && gameListAllD.length} //当前页的数据个数
              totalSize={gameListAll && gameListAll.totalCount} //列表总数量
              limitLen={limitLen} //限制每页加载的数量
              listTabKey={listTabKey}
              mescrollRef={el => this.mescrollRef = el}
              onLoadMore={async (pageNum, tabKey) => {
                // console.log("pageNum", pageNum, tabKey);
                let skipLen = pageNum * limitLen;
                if (tabKey === "1") {
                  await this.getPlayerGameList("ALLVISIBLE", "RECOMMEND", skipLen)
                } else if (tabKey === "2") {
                  await this.getPlayerGameList("ALLVISIBLE", "DEFAULT", skipLen)
                } else if (tabKey === "3") {
                  await this.getPlayerGameList("ALLVISIBLE", "HOTTEST", skipLen)
                } else if (tabKey === "4") {
                  await this.getPlayerGameList("UNDERDEVELOPMENT", "DEFAULT", skipLen)
                }
                await this.getGameListAllPlay()
                this._getListGameHeight()
              }
              }
            />
          </div>
        )}

      </ListDetailContext.Consumer>

    )
  }





}

const GamesListWithRouter = withRouter(withApollo(injectIntl(GameListNew)));
delete GamesListWithRouter.contextType;
export default GamesListWithRouter;