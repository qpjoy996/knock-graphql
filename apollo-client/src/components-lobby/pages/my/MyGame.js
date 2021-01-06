import React, { Component } from 'react'
import { withRouter } from 'react-router-guard'
import { Query, withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import * as jwtDecode from 'jwt-decode'
import { ApolloClient } from 'apollo-client'
import { ApolloLink } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import { HttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { PlatformContext } from 'states/context/PlatformContext'
import AuditModal from 'components-lobby/partial/modal/AuditModal'

import { importAll, _historyHandler, dateFormat } from 'utils'
import { injectIntl } from 'react-intl'

// import {getClient} from "../../../apollo-editor";
// import client from "../../../apollo";
// import PlatformContext from "states/context/PlatformContext";

const FETCH_MY_GAME = gql`
  query fetchMyGame {
    userGameList(skipLen: 0, limitLen: 48) {
      id
      name
      author
      assetID
      iconURL
      coverURL
      thumbnailURLs
      genre
      tags
      upvotes
      downvotes
      minPlayers
      maxPlayers
      version
      timestamp
    }
    #
    #        game(id: "game_0c5f2d2a-b0dd-4f06-a4aa-228adae2f5f8") {
    #            id
    #        }
  }
`

const PLAYER_HUB_GAME_LIST = gql`
  query playerHubGameList($input: PlayerHubGameListInput!) {
    playerHubGameList(input: $input) {
      totalCount
      list {
        id
        author
        name
        assetID
        iconURL
        upvotes
        downvotes
        heatValue
        minPlayers
        maxPlayers
        version
        timestamp
      }
    }
  }
`

//删除
const DELETE_ALLGAME = gql`
  mutation deleteGameAllVersion($gameID: String!) {
    deleteGameAllVersion(gameID: $gameID) {
      code
    }
  }
`

// let client = null;

class MyGame extends Component {
  static contextType = PlatformContext

  constructor(props) {
    super(props)
    this.state = {
      server: '',
      token: '',
      whichServer: '',
      client: null,
      auditModal: {
        isShowModal: false,
        text: '',
        type: '',
      },
      gameID: null,
    }

    const that = this
    // if (window.qtJSON) {
    //     let json = {
    //         type: 'on',
    //         name: 'setConfig',
    //         cb: (server, token) => {
    //             that.setState({
    //                 uri: server,
    //                 token: token
    //             });
    //             alert(`uri: ${server}, token: ${token}`);
    //             getClient({uri: server, token})
    //         }
    //     }
    //     window.qtJSON(json);
    // }

    // console.log(
    //     getClient({uri: ''}) === getClient({})
    // );
  }

  getClient = (options) => {
    // let server = options && options.server ? options.server : 'http://dev.adam.avatar.lilithgames.ga/graphql';
    // let token = options && options.token ? options.token : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1Njg3NzkzOTEsImlkIjoicGlkOmJsbzczNjdiaGxjOW1ydWtlYm4wIiwib3JpZ19pYXQiOjE1Njg3NzU3OTF9.ku-2nPQMmsr-9y15zy7jWSBcG7rIdFxVSm89OxTjHVM';
    let server = options && options.server ? options.server : ''
    let token = options && options.token ? options.token : ''
    const authLink = setContext((_, { headers }) => {
      // const token = localStorage.getItem('auth-token');
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        },
      }
    })

    const cache = new InMemoryCache()

    let client = new ApolloClient({
      link: ApolloLink.from([
        authLink,
        new HttpLink({
          // uri: 'http://192.168.14.19:9041/graphql',
          // uri: 'http://192.168.6.214:9041/graphql',
          // uri: 'http://dev.adam.avatar.lilithgames.ga/graphql',
          // uri: 'http://192.168.14.27:11141/graphql',
          // credentials: 'include'
          uri: server,
        }),
      ]),
      cache,
      // connectToDevTools: true
    })
    return client
  }

  async componentDidMount() {
    const that = this
    if (window.qtJSON) {
      let json = {
        type: 'on',
        name: 'setConfig',
        cb: (server, token) => {
          // let whichServer = '';
          // if (server.indexOf('47.103.112.134') >= 0) {
          //     whichServer = 'GameJam'
          // } else if (server.indexOf('192.168.6.214') >= 0) {
          //     whichServer = 'TestServer'
          // } else if (server.indexOf('local')) {
          //     whichServer = 'Local'
          // }

          that.setState({
            server,
            token,
            // whichServer,
            client: that.getClient({
              server,
              token,
            }),
          })

          // client = getClient({
          //     server,
          //     token
          // });
        },
      }
      window.qtJSON(json)
    }

    // setTimeout(() => {
    //     let client = that.getClient();
    //
    //     that.setState({
    //         server: 'http://dev.adam.avatar.lilithgames.ga/graphql',
    //         token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1Njg3NzkzOTEsImlkIjoicGlkOmJsbzczNjdiaGxjOW1ydWtlYm4wIiwib3JpZ19pYXQiOjE1Njg3NzU3OTF9.ku-2nPQMmsr-9y15zy7jWSBcG7rIdFxVSm89OxTjHVM',
    //         client
    //         // new ApolloClient({
    //         // uri: "http://192.168.6.214:9041/graphql"
    //         // })
    //         // getClient({
    //         // token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE1Njg3NzkzOTEsImlkIjoicGlkOmJsbzczNjdiaGxjOW1ydWtlYm4wIiwib3JpZ19pYXQiOjE1Njg3NzU3OTF9.ku-2nPQMmsr-9y15zy7jWSBcG7rIdFxVSm89OxTjHVM',
    //         // })
    //     })
    // }, 5000);
  }

  _updateGame = async (item, value) => {
    item.space = value
    console.log('item', item)
    if (window.qtJSON) {
      let json = {
        type: 'emit',
        name: 'updateGame',
        cb: function () {
          // return asset.id;
          return JSON.stringify(item)
        },
      }
      window.qtJSON(json)
    }
  }

  _deleteGameApi = async (gameID) => {
    console.log('gameID', gameID)
    const { client } = this.props
    client
      .mutate({
        mutation: DELETE_ALLGAME,
        variables: {
          gameID,
        },
      })
      .then((dt) => {
        console.log('删除成功', dt)
        this.getGameModal('Error', '游戏删除成功')
      })
      .catch((error) => {
        console.log('删除失败', error)
        let message =
          (error.graphQLErrors[0] && error.graphQLErrors[0].message) ||
          error.message
        this.getGameModal('Error', message + ', 游戏删除失败')
      })
  }

  getGameModal = (type, value, gameInfo) => {
    console.log('gameInfo', gameInfo)
    this.setState({
      auditModal: {
        isShowModal: true,
        text: value,
        type: type,
      },
      gameID: gameInfo && gameInfo.id,
    })
  }

  closeModal = () => {
    this.setState({
      auditModal: {
        isShowModal: false,
      },
    })
  }

  render() {
    const webpackContext = require.context(
      'assets-lobby/img/search-result',
      false,
      /\.(png|jpe?g|svg)$/
    )
    const images = importAll(webpackContext)

    const {
      whichServer,
      server,
      token,
      client,
      auditModal,
      gameID,
      version,
    } = this.state

    const MyGameQuery = ({ client, server, token }) => {
      console.log(client, '  - - -- - client', server, token)
      return (
        <Query
          query={FETCH_MY_GAME}
          client={client}
          fetchPolicy={'network-only'}
        >
          {({ loading, error, data, client }) => {
            if (loading) {
              return <div>Loading...</div>
            }
            if (error) {
              console.log(error)
              return <div>Error!</div>
            }
            if (data) {
              if (!data.userGameList) {
                data.userGameList = []
              }
              return data.userGameList.length ? (
                data.userGameList.map((item) => {
                  let time = item.timestamp
                    ? item.timestamp.substring(0, 10)
                    : 'not recorded'
                  return (
                    <div
                      className="my-game__list-item"
                      key={item.id ? item.id : Math.random()}
                    >
                      <div
                        className="my-game__list-l"
                        style={{
                          backgroundImage: `url(${
                            item.iconURL
                              ? item.iconURL
                              : images['game_intro_u1773.svg']
                          })`,
                        }}
                      ></div>
                      <div className="my-game__list-r">
                        <div className="my-game__list-r-t">{item.name}</div>
                        <div className="my-game__list-r-b">
                          {time}
                          <a
                            className="a-btn"
                            onClick={() => this._updateGame(item, 0)}
                          >
                            Update
                          </a>
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div>no games...</div>
              )
            } else {
              return <div>no games....</div>
            }
          }}
        </Query>
      )
    }

    const WorkShopQuery = ({ client, server, token }) => {
      console.log(client, '  - - -- - WorkShopQuery client', server, token)
      // let jwtToken = this.state.token + '/// jwt token'
      let decoded = jwtDecode(this.state.token)
      console.log('==============', decoded.id)
      return (
        <Query
          query={PLAYER_HUB_GAME_LIST}
          client={client}
          fetchPolicy={'network-only'}
          variables={{
            input: {
              filter: 'UNDERDEVELOPMENT',
              sorter: 'DEFAULT',
              skipLen: 0,
              limitLen: 100,
            },
          }}
        >
          {({ loading, error, data, client }) => {
            if (loading) {
              return <div>Loading...</div>
            }
            if (error) {
              console.log(error)
              return <div>Error!</div>
            }
            if (data) {
              console.log(data)
              if (!data.playerHubGameList) {
                data.playerHubGameList = []
              }
              return data.playerHubGameList.list &&
                data.playerHubGameList.list.length ? (
                data.playerHubGameList.list.map((item) => {
                  let time = item.timestamp
                    ? dateFormat(
                        'yyyy-MM-dd hh:mm:ss',
                        new Date(item.timestamp)
                      )
                    : 'not recorded'

                  return (
                    <div
                      className="my-game__list-item"
                      key={item.id ? item.id : Math.random()}
                    >
                      <div
                        className="my-game__list-l"
                        style={{
                          backgroundImage: `url(${images['icon_workshop.png']})`,
                        }}
                      ></div>
                      <div className="my-game__list-r">
                        <div className="my-game__list-r-t">{item.name}</div>
                        <div className="my-game__list-r-t">V{item.version}</div>
                        <div className="my-game__list-r-b">
                          <div style={{ width: '75px' }}>{time}</div>
                          {decoded.id === item.author ? (
                            <>
                              <a
                                className="a-btn"
                                style={{
                                  backgroundColor: 'red',
                                  width: '60PX',
                                  margin: '0 5px',
                                }}
                                onClick={() =>
                                  this.getGameModal('Warning', '删除游戏', item)
                                }
                              >
                                Delete
                              </a>
                              <a
                                className="a-btn"
                                onClick={() => this._updateGame(item, 1)}
                              >
                                Update
                              </a>
                            </>
                          ) : (
                            <span style={{ color: '#ccc' }}>仅限作者操作</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div>no games...</div>
              )
            } else {
              return <div>no games....</div>
            }
          }}
        </Query>
      )
    }

    // game_intro_u1773.svg
    return (
      <div className="my-game">
        <div>
          <div className="my-game__title">
            Online games
            {/*{server}*/}
            {/*{token}*/}
          </div>

          <div className="my-game__list">
            {client ? (
              <>
                {/*<MyGameQuery />*/}
                {/*{*/}

                {/*<ApolloProvider client={client} as={"extraClient"}>*/}
                {/*        /!*<ApolloProvider client={getClient({server, token})} as={"extraClient"}>*!/*/}
                <MyGameQuery client={client} server={server} token={token} />
                {/*        /!*<RouterGuard config={routes}>*!/*/}
                {/*        /!*</RouterGuard>*!/*/}
                {/*    </ApolloProvider>*/}
                {/*}*/}
              </>
            ) : (
              <div>No server&token passed here!</div>
            )}
          </div>
        </div>

        <div>
          <div className="my-game__title">
            Workshop
            {/*{server}*/}
            {/*{token}*/}
          </div>
          <div className="my-game__list">
            {client ? (
              <WorkShopQuery client={client} server={server} token={token} />
            ) : (
              <div>No server&token passed here!</div>
            )}
          </div>
        </div>
        {auditModal.isShowModal ? (
          <AuditModal
            type={auditModal.type}
            stateValue={auditModal.text}
            onClose={this.closeModal}
            onOk={() => {
              this._deleteGameApi(gameID, version)
            }}
          />
        ) : null}

        {/*<div style={{*/}
        {/*    position: 'fixed',*/}
        {/*    bottom: '0'*/}
        {/*}}>*/}
        {/*    <p style={{*/}
        {/*        color: 'white',*/}
        {/*        fontSize: '0.12rem',*/}
        {/*        fontFamily: `'Arial Nomal', 'Arial'`,*/}
        {/*        fontStyle: 'normal',*/}
        {/*        marginBottom: '0',*/}
        {/*        lineHeight: '1.5'*/}
        {/*    }}>作品截止提交时间：*/}
        {/*        <span style={{*/}
        {/*            color: '#FFCC00'*/}
        {/*        }}>10月20日 23:59:59&nbsp;</span>*/}
        {/*        ，届时地图上传功能将关闭，请合理安排时间哦！</p>*/}
        {/*    <p style={{*/}
        {/*        color: 'white',*/}
        {/*        fontSize: '0.12rem',*/}
        {/*        lineHeight: '1.5'*/}
        {/*    }}>最终版上传地图命名规则“*/}
        {/*        <span style={{*/}
        {/*            color: '#FFCC00'*/}
        {/*        }}>*/}
        {/*        &nbsp;游戏名+【参赛作品】&nbsp;*/}
        {/*        </span>*/}
        {/*        ”，非参赛相关地图21号将会隐藏，示例：Demon Hunter【参赛作品】、Night Elf【参赛作品】</p>*/}
        {/*</div>*/}
      </div>
    )
  }
}

const MyGameWithRouter = withRouter(withApollo(injectIntl(MyGame)))
delete MyGameWithRouter.contextType
export default MyGameWithRouter
