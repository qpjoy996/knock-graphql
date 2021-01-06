import React, { Fragment, useImerativeHandle } from 'react';
import { Query, withApollo, Mutation } from 'react-apollo';
import { withRouter, Link } from 'react-router-guard';
import { ENTER_START_GAMEPAGE, QUERY_MYSELF } from "apollo/graphql/gql";
import { importAll, errorHandler, _navigate, _getIn, charCodeLen, setStateAsync } from "utils";
import { PlatformContext } from "states/context/PlatformContext";
import { PUBLIC_URL } from 'states/APP_STATE';
import MescrollList from 'components/partial/scroll/MescrollList';
import GameCard from 'components/partial/card/GameCard'
import { unityJSON, unityListen } from "utils/lib/unity";
import GameListBanner from 'components/partial/card/GameListBanner'
import ListDetailContext from '@/states/context/ListDetailContext'


let gameCardItemHeight, cardImg, timeoutVal;
const limitLen = 6;
const tabList = [
  { key: '1', tab: 'Recommend' },
  { key: '2', tab: 'New Arrivals' },
  { key: '3', tab: 'Hottest' },
  { key: '4', tab: 'Workshop' }
]
// 收藏和lastplay
const LastPlayed = ({ item }) => {
  const webpackContext = require.context('assets/img/home', false, /\.(png|jpe?g|svg)$/);
  const images = importAll(webpackContext);
  return (
    <div className="game-list-top" >
      <div className="list_top_img"
        style={{ backgroundImage: `url(${item.iconURL ? item.iconURL : images['list_game.png']})` }}
      // onClick={() => { getGameDetail(item, 'favorite') }}
      ></div>
      <div className="top-detail">
        <p>{item.name}</p>
        <div className="card-text-count">
          <img className="text-img" src={images['fire-fill.svg']} alt='' />
          <span className="text-span">2485</span>
        </div>
      </div>
    </div>
  )
}


class GameListNewTab extends React.Component {
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
      errorMsg: null
    }
  }

  async componentDidMount () {
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

    // const that = this;
    // unityListen('refreshAvatar', async function () {
    //   console.log('收到换装事件')
    //   await that.refreshAvatar();
    // });
    // await this.refreshAvatar();
    // await this.getInfo();


  }


  _getListGameHeight = () => {
    const { gamePlayhubOrOnlineList } = this.state
    let listHeight;
    let gameCard = this.gameCardRef;
    console.log(gamePlayhubOrOnlineList);
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

  }

  getInfo = async () => {
    this._getListGameHeight()
    //favorite
    const { favoriteList } = this.state
    let favoriteLen = favoriteList.userFavoritedGameList && favoriteList.userFavoritedGameList.list
      && favoriteList.userFavoritedGameList.list.length > 0;
    if (favoriteLen) {
      await setStateAsync({
        gamePlayKey: "1"
      }, this)
    } else {
      await setStateAsync({
        gamePlayKey: "2"
      }, this)
    }
  }

  getPlayerGameList = async (filter, sorter, skipLen, keyword) => {
  }

  // banner点击
  getBannerClick = async (item) => {

  }

  componentDidUpdate (nextProps, nextState) {
    // 不同对象共用一个mescroll的情况,重置刷新
    if (nextState.listTabKey != this.state.listTabKey) {
      this._getListGameHeight();
    }
  }

  //favorite
  onChangeGamePlayTabs = async (key) => {
    await setStateAsync({
      gamePlayKey: key
    }, this)
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
    const { listTabKey, gamePlayhubOrOnlineList, gameListAll, keyword } = this.state;
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
  }

  // queryMyself
  queryMyself = async () => {

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

  getQueryWard = async (id) => {

  }


  getGameDetail = (item, str, listTabKey, disableNavigation) => {

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

  render () {
    const webpackContext = require.context('assets/img/home', false, /\.(png|jpe?g|svg)$/);
    const webpackContextBasic = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    const basicImages = importAll(webpackContextBasic);
    const { listTabKey, userInfo, lastPlayGame, friendsCount, keyword, isWorkshop, gamePlayKey,
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

    const favoriteLen = favoriteList && favoriteList.list && favoriteList.list.length > 0;
    const lastplayLen = lastPlayGame && lastPlayGame.length > 0;
    return (
      <ListDetailContext.Consumer>
        {({ triggerTrasition }) => (
          <div className="game-home">
            <div className="game-home-header">
              <div>
                <video className="game-video" width="100%" autoPlay loop muted
                  poster={images['Bitmap.png']}
                  ref={el => this.videoElement = el}>
                  <source src={PUBLIC_URL + "/static/game_playhub.mp4"}
                    type="video/mp4" />
                  <p>Sorry, your browser doesn't support embedded videos.</p>
                </video>
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
              </div>
            </div>
            <MescrollList
              title={null}
              children={
                <div className="home-all" >
                  <div className="game-home-list" ref={el => this.homeListBanner = el}>
                    <div className="game-header-icon"></div>
                    <div className="list-images">
                      <div className="list-bananer">
                        <div className="contain" >
                          {// 大banner
                            bannerLists.bigBanner && bannerLists.bigBanner.length > 0 ? (
                              <></>
                              // <GameListBanner
                              //   bannerLists={bannerLists}
                              //   getBannerClick={getBannerClick}
                              //   getQueryWard={getQueryWard}
                              //   getGameDetail={getGameDetail}
                              // />
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
                                  index === 0 ? <img src={item.thumbnailURLs[0] ? item.thumbnailURLs[0] : images['header_list_game.png']} alt='icon' onClick={() => {
                                    // getBannerClick(item); unityJSON("showConversation");
                                  }} /> : null
                                }
                              </Fragment>
                            )
                          })
                        ) : null
                      }
                    </div>
                    <div ref={el => this.homeList = el} className="list-games">
                      {
                        !favoriteLen && !lastplayLen ? null : (
                          <>
                            <div className="line-listgames"></div>
                            <div className="list-tab">
                              {
                                favoriteLen ? (
                                  <p className={gamePlayKey === "1" ? "active" : ""}
                                    onClick={() => { this.onChangeGamePlayTabs("1") }}>Favorite</p>
                                ) : null}
                              {
                                lastplayLen ? (
                                  <p className={!favoriteLen
                                    || gamePlayKey === "2" ? "active" : ""}
                                    onClick={() => { this.onChangeGamePlayTabs("2") }}>Last Played</p>
                                ) : null
                              }
                            </div>
                            <div className="gameplay_tablist">
                              {
                                favoriteLen && gamePlayKey === "1" ? (
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
                                lastplayLen && gamePlayKey === "2" ? (
                                  lastPlayGame.map((item, index) => {
                                    return (
                                      <Fragment key={item.gameID + index}>
                                        <LastPlayed item={item} />
                                      </Fragment>
                                    )
                                  })
                                ) : null
                              }
                            </div>
                          </>
                        )
                      }
                    </div>
                  </div>
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
                                    onClick={() => { this.onChangeTabs(item.key) }}>{item.tab}</p>
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
                                  <p>No Game Here</p>
                                </div>
                                {
                                  keyword != '' ? null : (
                                    <div className="lets-play-card-bottom-text">
                                      <span>More Games Coming Soon...</span>
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
                                      <p>No Game Here</p>
                                    </div>
                                    <div className="lets-play-card-bottom-text">
                                      <span>{errorMsg}</span>
                                    </div>
                                  </div>
                                ) : (
                                    <div className="data-refresh">
                                      <div className="loading"></div>
                                      <span>Loading...</span>
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
              noMoreData="More Games Coming Soon..."
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

const GameListNewTabWithRouter = withRouter(withApollo(GameListNewTab));
delete GameListNewTabWithRouter.contextType;
export default GameListNewTabWithRouter;