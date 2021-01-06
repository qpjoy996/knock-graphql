import React from 'react';
import { Tabs, Icon } from 'antd';
import BasicCard from 'components/partial/card/BasicCard'
import ListCard from 'components/partial/card/ListCard'
import { withApollo, Query } from 'react-apollo';
import { withRouter } from 'react-router-guard';
import { QUERY_USERS } from "apollo/graphql/gql";
import { importAll, charCodeLen, errorHandler, _getIn } from "utils";
import { QUERY_MYSELF } from "../../../apollo/graphql/gql";
import FriendCardContext from '@/states/context/FriendCardContext';
import ImgLoade from 'components/partial/load/ImgLoad';
import ListInfinite from 'components/partial/scroll/ListInfinite';

const { TabPane } = Tabs;

class SearchCard extends React.Component {
  state = {
    nickname: '',
    tabList: true,
    searchNickname: null,
    activeKey: '1',
    refetchFriends: null,
    loadedImg: null
  }

  _setState (state) {
    this.setState(state)
  }

  componentDidMount () {
    const {
      client
    } = this.props;

    // client.query({
    //   query: QUERY_FRIENDS,
    //   variables: {
    //     "typ": "FOLLOWING",
    //     "skipLen": 0,
    //     "limitLen": 1000,
    //     "status": "OFFLINE",
    //     "status1": "ONLINE"
    //   }
    // })
  }

  onSearch = (e) => {
    this.setState({
      nickname: e.target.value,
      // tabList: false
    })
  }

  onKeydown = (e) => {
    if (e.key === 'Enter') {
      this.searchNickname();
    }
  }

  onChangeList = () => {
    this.setState({
      nickname: '',
      searchNickname: null,
      tabList: true
    })
  }

  searchNickname = () => {
    const {
      nickname
    } = this.state;
    this.setState({
      searchNickname: nickname,
      tabList: false
    })
  }

  render () {
    const webpackContext = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    let platformContext = this.context;
    let i18nMapping = platformContext.i18nConfig;
    const {
      nickname,
      tabList,
      searchNickname,
      activeKey,
      loadedImg
    } = this.state;
    return (
      <div className="card-container">
        <div className="search-card-drawer">
          <div className="search-card-drawer-title">
            <Query query={QUERY_MYSELF}>
              {
                ({ data, loading, error }) => {
                  if (loading) return 'Loading...'
                  if (error) return `Error..., ${errorHandler({
                    error,
                    mapping: i18nMapping.messages
                  })}`
                  let userInfo = _getIn(data, 'queryMyself', 'userInfo')
                  if (userInfo) {
                    return (
                      <>
                        {
                          loadedImg ? (
                            <div className="head-bg-image" style={{
                              backgroundImage: `url(${loadedImg === '' ? images['Icon_head.png'] : loadedImg})`
                            }}>
                            </div>
                          ) : (
                              <div className="data-loading head-bg-image"></div>
                            )
                        }
                        <div>
                          <span
                            className={`${charCodeLen(userInfo.nickname) > 20 ? 'head-nickname' : ''}`}>{userInfo.nickname || 'No name'}</span>
                          <span>#{userInfo.nameSeq || 'No seq'}</span>
                        </div>
                        <ImgLoade imgUrl={userInfo && userInfo.iconURL ? userInfo.iconURL : ''}
                          loadedImg={(value) => this.setState({ loadedImg: value })} />
                      </>
                    )
                  } else {
                    return (
                      <div>
                        Rendering userProfile...
                      </div>
                    )
                  }
                }
              }
            </Query>
          </div>
          <div className="card-drawer-content">
            <div className="search-input">
              <input placeholder="Type nickname" value={nickname || ''} onChange={this.onSearch}
                onKeyDown={this.onKeydown} />
              {
                (searchNickname || searchNickname === '') ? (
                  <Icon type="close" className="input-clear-icon" onClick={this.onChangeList} />
                  // <img src={images['Icon_close.svg']} />
                ) : null
              }
              <Icon type="search" onClick={this.searchNickname} />
            </div>
            {
              tabList ? (
                <FriendCardContext.Provider value={{ ...this.state, _setState: state => this._setState(state) }}>
                  <Tabs animated={false} defaultActiveKey={activeKey} onChange={() => { this.state.refetchFriends && this.state.refetchFriends() }}>
                    <TabPane tab="Friends" key="1" forceRender={true}>
                      <ListCard typ={'FRIEND'} />
                    </TabPane>
                    <TabPane tab="Following" key="2" forceRender={true}>
                      <ListCard typ={'FOLLOWING'} />
                    </TabPane>
                    <TabPane tab="Followers" key="3" forceRender={true}>
                      <ListCard typ={'FOLLOWER'} />
                    </TabPane>
                  </Tabs>
                </FriendCardContext.Provider>
              ) :

                (searchNickname || searchNickname === '') ?
                  (

                    <Query query={QUERY_USERS}
                      fetchPolicy={'cache-and-network'}
                      variables={{
                        limitLen: 100,
                        skipLen: 0,
                        keyword: searchNickname
                      }}
                    >
                      {
                        ({ loading, error, data, refetch, fetchMore }) => {
                          console.log('this is search data', data);
                          if (error) {
                            return (
                              <div className="card-list-nothing" onClick={() => {
                                refetch();
                              }}>
                                <div className="img"
                                  style={{ backgroundImage: `url(${images['Pic_nothing_suit.png']})` }}></div>
                                <p>
                                  {
                                    errorHandler({
                                      error,
                                      mapping: i18nMapping.messages
                                    })
                                  }
                                </p>
                              </div>
                            )
                          }

                          const hasMore = !!data && (data.searchUserCount > data.searchUserList.length);

                          return (!!data && data.searchUserList) ? (
                            <>
                              <ListInfinite className="search-card-list"
                                children={
                                  <BasicCard cardList={data.searchUserList} />
                                }
                                // hasMore={hasMore}
                                loading={loading}
                                refresh={false}
                                loadMore={true}
                                onLoadMore={() =>
                                  fetchMore({
                                    variables: {
                                      skipLen: data.searchUserList.length
                                    },
                                    updateQuery: (prev, { fetchMoreResult }) => {
                                      console.log(prev, ' - -  - - - - this is prev!!!');
                                      if (!fetchMoreResult) return prev;
                                      return Object.assign({}, prev, {
                                        searchUserList: [...prev.searchUserList, ...fetchMoreResult.searchUserList]
                                      })
                                    }
                                  })
                                }

                              // onLoadMore={() =>
                              //   fetchMore({
                              //     variables: {
                              //       skipLen: data.gameList.length
                              //     },
                              //     updateQuery: (prev, { fetchMoreResult }) => {
                              //       console.log(prev, ' - -  - - - - this is prev!!!');
                              //       if (!fetchMoreResult) return prev;
                              //       return Object.assign({}, prev, {
                              //         gameList: [...prev.gameList, ...fetchMoreResult.gameList]
                              //       })
                              //     }
                              //   })
                              // }
                              />
                            </>
                          ) : (
                              <div className="card-list-nothing">
                                <div className="img"
                                  style={{ backgroundImage: `url(${images['Pic_nothing_suit.png']})` }}></div>
                                <p>No Player Here</p>
                              </div>
                            )
                          // if (loading) {
                          //   return (
                          //     <div className="data-loading client-loading"></div>
                          //   )
                          // }                                                 
                        }
                      }
                    </Query>

                  ) : (
                    <div className="search-card-list"></div>
                  )
            }
          </div>

        </div>

      </div>
    )
  }
}

// export default SearchCard;
const SearchCardWithRouter = withRouter(withApollo(SearchCard));
delete SearchCardWithRouter.contextType;
export default SearchCardWithRouter;



