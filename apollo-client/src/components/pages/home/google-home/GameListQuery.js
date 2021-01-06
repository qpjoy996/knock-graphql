import React from 'react';
import { Query, withApollo } from 'react-apollo';
import { withRouter } from 'react-router-guard';
import { injectIntl, FormattedMessage } from "react-intl";
import { importAll, errorHandler, _navigate, _getIn } from "utils";
// import ListInfinite from 'components/partial/scroll/ListInfinite';
// import BtnEdit from 'components/partial/button/BtnEdit';
import MescrollList from 'components/partial/scroll/MescrollList';

import { GET_GAME_LIST, ENTER_START_GAMEPAGE, QUERY_BANNER, ENTER_QUESTIONNAIRE } from "apollo/graphql/gql";
import { PlatformContext } from "states/context/PlatformContext";
import { unityJSON } from "utils/lib/unity";

const limitLen = 5;
let timeoutVal;

class GameListQuery extends React.Component {

  static contextType = PlatformContext;

  constructor(props) {
    super(props);
    this.state = {
      gamesLoaded: false
    }
  }

  componentWillUnmount () {
    clearTimeout(timeoutVal); //清除页面定时器，避免fetchMore is undifined
  }

  getGameDetail = (item) => {
    this.sendIntoGame(item.id)
    _navigate(`/home/games/${item.id}`, 'homeGameDetail', {
      id: item.id
    })
  }

  getQuestionnaire = () => {
    // 点击后banner变化
    const { client, isWindows } = this.context;
    client.mutate({
      mutation: ENTER_QUESTIONNAIRE
    }).then(resp => {
      console.log('resp-enterQuestionnaire', resp)
    }).catch(err => {
      console.log('err-enterQuestionnaire', err)
    })
    // if (isWindows) {
    //   window.location.href = 'https://survey.163.com/web/htmls/n03gsz/paper.html';
    //   return;
    // }
    unityJSON('openExternalUrl', 'https://survey.163.com/web/htmls/n03gsz/paper.html');

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

  render () {
    const webpackContext = require.context('assets/img/home', false, /\.(png|jpe?g|svg)$/);
    const webpackContextBasic = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    const basicImages = importAll(webpackContextBasic);
    let platformContext = this.context;
    let i18nMapping = platformContext.i18nConfig;

    return (
      <Query query={GET_GAME_LIST}
        fetchPolicy={'cache-and-network'}
        variables={{
          sortType: 'latest',
          skipLen: 0,
          // limitLen: 1000,
          limitLen: limitLen,
        }}
      >
        {
          ({ loading, error, data, refetch, fetchMore }) => {
            // (!firstLoaded && loading)?(<div className="data-loading client-loading"></div>):
            if (error) {
              return (
                <div className="lets-play lets-play-card">
                  <div className="gameList-title">
                    <p>
                      <FormattedMessage id="home.games.lets_play" />
                      {/* Let's Play! */}
                    </p>
                  </div>
                  <div className="card-list-nothing" style={{ marginTop: '40px' }} onClick={() => {
                    refetch();
                  }}>
                    <div className="img"
                      style={{ backgroundImage: `url(${basicImages['Pic_nothing_suit.png']})` }}></div>
                    <p>
                      {
                        errorHandler({
                          error,
                          mapping: i18nMapping.messages
                        }) || 'Fetching data error...'
                      }
                    </p>
                  </div>
                </div>

              )
            }
            // const hasMore = !!data && (data.gameCount > data.gameList.length);
            return (!!data && data.gameList) ? (
              <div className="lets-play-bg">
                <div className="lets-play">
                  <MescrollList
                    className="lets-play-card"
                    title={
                      <div className="gameList-title">
                        <p>
                          <FormattedMessage id="home.games.lets_play" />
                          {/* Let's Play! */}
                        </p>
                      </div>
                    }
                    children={
                      <div id="dataList">
                        {
                          data.gameList.length ? (
                            <>
                              {
                                data.gameList.map((item, index) => {
                                  let gameListLength = data.gameList.length - 1;
                                  item.count = `${item.minPlayers} ${item.maxPlayers ? ('- ' + item.maxPlayers) : ''}`;
                                  item.bgColor = ['#6ea0ff', '#ffa450', '#ff6363'][index % 3];
                                  return (
                                    <div key={index}>
                                      <div className="lets-play-card-item" style={{ backgroundColor: item.bgColor }}
                                        key={item.id}
                                        onClick={(e) => {
                                          this.getGameDetail(item)
                                        }}>
                                        <div className={`card-img ${!item.iconURL ? 'imgError' : ''}`}
                                          style={{ backgroundImage: `url(${item.iconURL ? item.iconURL : images['Pic_game01.png']}` }}></div>
                                        <div className="card-text">
                                          <span>{item.name}</span>
                                          <div className="card-text-count">
                                            <img className="text-img" src={images['Icon_friends.svg']} alt='' />
                                            <span className="text-span">{item.count}</span>
                                          </div>
                                        </div>
                                      </div>
                                      {
                                        index === 0 || index === gameListLength ? (
                                          <Query query={QUERY_BANNER}
                                            fetchPolicy={'no-cache'}
                                          >{
                                              ({ loading, error, data }) => {
                                                if (data && data.queryMyself && data.queryMyself.userInfo) {
                                                  let { questionnaireDone, questionnaireAble } = data.queryMyself.userInfo;
                                                  let isShowQuestion = (!questionnaireDone && index === 0) || (questionnaireDone && index === gameListLength);
                                                  if (isShowQuestion && questionnaireAble) {
                                                    return (
                                                      <div className="play-card-banner"
                                                        onClick={this.getQuestionnaire}
                                                      >
                                                        <img src={images['Bg-banner.jpg']} alt='card' />
                                                      </div>
                                                    )
                                                  } else {
                                                    return null;
                                                  }
                                                } else {
                                                  console.log('query game', loading, error, data);
                                                  return null;
                                                }
                                              }
                                            }
                                          </Query>
                                        ) : (<></>)
                                      }
                                    </div>
                                  )
                                })
                              }
                              {/* {
                                !hasMore && (
                                  <div className="lets-play-card-bottom-text">
                                    <span>More Coming Soon...</span>
                                  </div>
                                )
                              } */}
                            </>
                          ) : (
                              <div>
                                <div className="card-list-nothing" style={{ marginTop: '40px' }}>
                                  <div className="img" style={{ backgroundImage: `url(${basicImages['Pic_nothing_suit.png']})` }}></div>
                                  <p>No Game Here</p>
                                </div>
                                <div className="lets-play-card-bottom-text">
                                  <span>More Coming Soon...</span>
                                </div>
                              </div>
                            )
                        }
                      </div>
                    }
                    noMoreData="More Coming Soon..."
                    isrefresh={true} //下拉刷新
                    loading={loading} //数据请求的加载状态
                    curPageSize={data.gameList.length} //当前页的数据个数
                    totalSize={data.gameCount} //列表总数量
                    limitLen={limitLen} //限制每页加载的数量
                    onLoadMore={(pageNum) => {
                      timeoutVal = setTimeout(function () {
                        fetchMore({
                          variables: {
                            skipLen: pageNum * limitLen //页数*每页显示的数量
                          },
                          updateQuery: (prev, { fetchMoreResult }) => {
                            if (!fetchMoreResult) return prev;
                            return Object.assign({}, prev, {
                              gameList: [...prev.gameList, ...fetchMoreResult.gameList]
                            })
                          }
                        })
                      }, 500)
                    }}
                  />
                </div>
              </div>
            ) : (
                <div className="lets-play lets-play-card">
                  <div className="gameList-title" style={{ marginBottom: '40px' }}>
                    <p>
                      <FormattedMessage id="home.games.lets_play" />
                      {/* Let's Play! */}
                    </p>
                  </div>
                  {
                    loading ? (
                      <div className="card-list-loading">
                        <img src={basicImages['loading_gray.png']} alt='loading' />
                      </div>
                    ) : (
                        <div>
                          <div className="card-list-nothing">
                            <div className="img" style={{ backgroundImage: `url(${basicImages['Pic_nothing_suit.png']})` }}></div>
                            <p>
                              <FormattedMessage id="home.games.no_game" />
                              {/* No Game Here */}
                            </p>
                          </div>
                          <div className="lets-play-card-bottom-text">
                            <span>
                              <FormattedMessage id="home.games.coming_soon" />
                              {/* More Coming Soon... */}
                            </span>
                          </div>
                        </div>
                      )
                  }

                </div>
              )
          }
        }
      </Query >
    )
  }
}

const GamesWithRouter = withRouter(withApollo(GameListQuery));
delete GamesWithRouter.contextType;
export default GamesWithRouter;
