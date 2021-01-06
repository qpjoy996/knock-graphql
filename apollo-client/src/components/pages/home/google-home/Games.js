import React from 'react';
import { Query, withApollo } from 'react-apollo';
import { withRouter } from 'react-router-guard';
import { importAll, errorHandler, _navigate, cacheImage } from "utils";
import ReactPullRefresh from "components/partial/scroll/ReactPullRefresh";
import BtnEdit from 'components/partial/button/BtnEdit';

import { GET_GAME_LIST, ENTER_START_GAMEPAGE } from "apollo/graphql/gql";
import { PlatformContext } from "states/context/PlatformContext";
import { unityJSON } from "utils/lib/unity";

class Games extends React.Component {

  static contextType = PlatformContext;

  constructor(props) {
    super(props);
    this.state = {
      isQuestion: localStorage.getItem('isQuestion')
    }
  }

  getGameDetail = (item) => {
    this.sendIntoGame(item.id)
    _navigate(`/home/games/${item.id}`, 'homeGameDetail', {
      id: item.id
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

  getQuestionnaire = () => {
    // window.location.href = 'https://survey.163.com/web/htmls/mi3uss/paper.html';
    unityJSON('openExternalUrl', 'https://survey.163.com/web/htmls/mi3uss/paper.html');
    // 点击后banner消失
    localStorage.setItem('isQuestion', false);
    this.setState({
      isQuestion: localStorage.getItem('isQuestion')
    })
  }

  render () {
    const webpackContext = require.context('assets/img/home', false, /\.(png|jpe?g|svg)$/);
    const webpackContextBasic = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    const basicImages = importAll(webpackContextBasic);
    let platformContext = this.context;
    let i18nMapping = platformContext.i18nConfig;

    const { isWindows } = this.context;
    const { isQuestion } = this.state;

    return (
      <div className="lets-play-bg">
        {/* <button onClick={() => this.test()}>
          <span style={{ fontSize: '80px' }}>测试专用</span>
        </button> */}
        {isWindows && <BtnEdit type="['friend']" />}
        <div className="lets-play">
          {/* <p style={{ backgroundImage: `url(${images['Icon_arrow.svg']})` }} onClick={this.letsPlay}>Lets Play !</p> */}
          <div className="lets-play-card">
            <Query query={GET_GAME_LIST}
              fetchPolicy={'no-cache'}
              variables={{
                sortType: 'latest',
                skipLen: 0,
                // limitLen: 1000,
                limitLen: 20,
              }}
            >
              {
                ({ loading, error, data, refetch }) => {
                  if (loading) {
                    return (
                      <div className="data-loading client-loading"></div>
                    )
                  }
                  if (error) {
                    return (
                      <div className="card-list-nothing" onClick={() => {
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
                    )
                  }

                  if (data.gameList && data.gameList.length) {
                    return (
                      <ReactPullRefresh children={
                        <div>
                          {
                            data.gameList.map((item, index) => {
                              item.count = `${item.minPlayers} ${item.maxPlayers ? ('- ' + item.maxPlayers) : ''}`;
                              item.bgColor = ['#6ea0ff', '#ffa450', '#ff6363'][index % 3];
                              return (
                                <div>
                                  <div className="lets-play-card-item" style={{ backgroundColor: item.bgColor }}
                                    key={item.id}
                                    onClick={() => this.getGameDetail(item)}>
                                    <div className={`card-img ${!item.iconURL ? 'imgError' : ''}`}
                                      style={{ backgroundImage: `url(${item.iconURL ? cacheImage(item.iconURL) : images['Pic_game01.png']}` }}></div>
                                    <div className="card-text">
                                      <span>{item.name}</span>
                                      <div className="card-text-count">
                                        <img className="text-img" src={images['Icon_friends.svg']} alt='' />
                                        <span className="text-span">{item.count}</span>
                                      </div>
                                    </div>
                                  </div>
                                  {
                                    index === 0 && isQuestion === 'true' ? (
                                      <div className="play-card-banner"
                                        onTouchEnd={() => {
                                          this.getQuestionnaire();
                                        }}
                                        onClick={this.getQuestionnaire}>
                                        <span>banner</span>
                                      </div>
                                    ) : null
                                  }
                                </div>

                              )
                            })
                          }
                          <div className="lets-play-card-bottom-text">
                            <span>More Coming Soon...</span>
                          </div>
                        </div>
                      }
                        // scrollBar={false}
                        maxAmplitude={200}
                        // debounceTime={10}
                        // throttleTime={500}
                        // deceleration={10}
                        // scrollSpeed={10}
                        // thresholdOffset={50}
                        // durationSpeed={100}
                        hasMore={false}
                        // loadMoreThrottle={10}
                        refresh={false} loadMore={false}
                      // easing='linear'
                      />
                    )
                  } else {
                    return (
                      <div>
                        <div className="card-list-nothing">
                          <div className="img" style={{ backgroundImage: `url(${images['Pic_nothing_suit.png']})` }}></div>
                          <p>No Game Here</p>
                        </div>
                        <div className="lets-play-card-bottom-text">
                          <span>More Coming Soon...</span>
                        </div>
                      </div>
                    )
                  }
                }
              }

            </Query>

            {/*{*/}
            {/*  cardList.map((item) => {*/}
            {/*    return (*/}
            {/*      <div className="lets-play-card-item" style={{backgroundColor: item.bgColor}} key={item.key}*/}
            {/*           onClick={() => this.getGameDetail(item)}>*/}
            {/*        /!* <img src={images[item.image]} /> *!/*/}
            {/*        <div className={`card-img ${!item.image ? 'imgError' : ''}`}*/}
            {/*             style={{backgroundImage: `url(${images[item.image]}`}}></div>*/}
            {/*        <div className="card-text">*/}
            {/*          <span>{item.title}</span>*/}
            {/*          <div className="card-text-count">*/}
            {/*            <img className="text-img" src={images['Icon_friends.svg']}/>*/}
            {/*            <span className="text-span">{item.count}</span>*/}
            {/*          </div>*/}
            {/*        </div>*/}
            {/*      </div>*/}
            {/*    )*/}
            {/*  })*/}
            {/*}*/}

          </div>
        </div>
      </div >
    )
  }
}

const GamesWithRouter = withRouter(withApollo(Games));
delete GamesWithRouter.contextType;
export default GamesWithRouter;
