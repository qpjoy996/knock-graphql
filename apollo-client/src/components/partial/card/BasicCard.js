import React from 'react';
import { Mutation } from 'react-apollo';
import { FOLLOW_USER, UNFOLLOW_USER, INVITE_TEAM_MEMBERS } from "apollo/graphql/gql";
import { importAll, charCodeLen, _getIn } from "utils";
import { unityJSON } from "utils/lib/unity";
import { PlatformContext } from "../../../states/context/PlatformContext";
import GameContext from '@/states/context/GameContext'
import BtnBasic from 'components/partial/button/BtnBasic'
// import ImgLoade from 'components/partial/load/ImgLoad';

import { injectIntl, FormattedMessage } from "react-intl";

class BasicCard extends React.Component {

  static contextType = PlatformContext;
  state = {
    loadedItems: [],
    avatarLoadingId: '',
  }

  showOtherAvatar = (item) => {
    let avatar_json = {
      avatarJSON: item.avatarJSON,
      hasAvatar: item.hasAvatar
    }

    unityJSON('showOtherAvatar', avatar_json);
  }

  judgeInvitable(userID) {
    const { teamInfo: { members } } = this.context;
    const { isOnline } = this.props
    let canInvite = !!isOnline
    if (members) {
      members.forEach(member => {
        if (_getIn(member, 'userID') === userID) {
          canInvite = false
        }
      })
    }
    return canInvite
  }

  judgeInvited = (userID) => {
    const { teamInfo: { pendingMembers } } = this.context;
    let invited = false;
    if (pendingMembers) {
      pendingMembers.forEach(member => {
        if (_getIn(member, 'userID') === userID) {
          invited = true
        }
      })
    }
    return invited
  }


  render() {
    const webpackContext = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    const { cardList, isOnline, invited, intl } = this.props;
    const { avatarLoadingId } = this.state;
    const { teamInfoSubscription, showGlobalMessage } = this.context
    return (
      <GameContext.Consumer>
        {gameContext => (
          <div>
            {
              cardList.map((item, id) => {
                return (
                  item.userID ? (
                    <div className="online-list"
                      key={item.userID}
                    >
                      <div>
                        {/* data-loading头像没加载之前loading添加该class */}
                        {/* {
                          loadedItems[id] && loadedItems[id].iconURL ? (
                            <div className="head-bg-image" style={{
                              backgroundImage: `url(${loadedItems[id].iconURL === '' ? images['Icon_head.png'] : item.iconURL})`
                            }}
                              onClick={() => this.showOtherAvatar(item)}
                            >
                            </div>
                          ) : (
                              <div className="data-loading head-bg-image" style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}></div>
                            )
                        } */}
                        <div className="head-bg-image" style={{
                          backgroundImage: `url(${item.iconURL ? item.iconURL : images['Icon_head.png']})`
                        }}
                          onClick={() => this.showOtherAvatar(item)}
                        >
                        </div>
                        <div className="online-list-text">
                          <p
                            className={`online-list-text-nickname ${charCodeLen(item.nickname) >= 20 && isOnline ? 'p-no-text' : ''}`}>{item.nickname}</p>
                          <span style={{ color: "#6d6d67" }}>#{item.nameSeq}</span>
                          {
                            (isOnline || item.status === 'ONLINE') ? (
                            <div><img src={images['Icon_CirGS.png']} /><span className='list-status'>{intl.messages['friend.online']||'Online'}</span>
                              </div>
                            ) : (
                                <div><img src={images['Icon_CirGgS.png']} /><span className='list-status'>{intl.messages['friend.offline']||'Offline'}</span>
                                </div>
                              )
                          }

                        </div>
                      </div>

                      {
                        invited && gameContext.gameInfo && _getIn(gameContext, 'gameInfo', 'maxPlayers') > (_getIn(gameContext, 'teamInfo', 'members', 'length') || 1) && this.judgeInvitable(item.userID) ? (
                          <div>
                            {/*<Button disabled>Invited</Button>*/}
                            <Mutation
                              mutation={INVITE_TEAM_MEMBERS}
                              onCompleted={data => {
                                teamInfoSubscription._subscribe();
                                this.setState({ avatarLoadingId: '' })
                              }}
                              onError={() => {
                                showGlobalMessage({
                                  content: 'Invite friend failed',
                                  type: "error"
                                }); this.setState({ avatarLoadingId: '' })
                              }}
                            >
                              {(invite, { data, loading, called, error }) => {
                                return <div>
                                  {
                                    this.judgeInvited(item.userID) ? (
                                      <div className="btn-invited">
                                        <BtnBasic type="small" okText={intl.messages['friend.invited']} disabled={true} />
                                      </div>
                                    ) : (
                                        <div>
                                          {
                                            item.userID === avatarLoadingId && !error ? (
                                              // 按钮消失，显示loading图标
                                              <div className="loading-gray"><img src={images["loading_gray.png"]} alt="load" /></div>
                                            ) : (
                                                <BtnBasic type="small" okText={intl.messages['friend.invite']} loading={false}
                                                  onClick={() => {
                                                    this.setState({ avatarLoadingId: item.userID })
                                                    invite({
                                                      variables: {
                                                        input: {
                                                          gameID: gameContext.gameInfo.id,
                                                          userIDList: [item.userID]
                                                        },
                                                      }
                                                    })
                                                  }}
                                                />
                                              )
                                          }
                                        </div>
                                      )
                                  }
                                </div>
                              }}
                            </Mutation>
                          </div>
                        ) :
                          (item.friendshipState === 'FOLLOWING' || item.friendshipState === 'FRIEND') ? (
                            <div>
                              {
                                item.userID === avatarLoadingId ? (
                                  // 按钮消失，显示loading图标
                                  <div className="loading-gray"><img src={images["loading_gray.png"]} alt="load" /></div>
                                ) : (
                                    <div className="card-icon-unfollow">
                                      <img src={images['Icon_sl.svg']} alt='' />
                                      <div className="card-icon-unfollow-tooltip">
                                        <img src={images['Icon_bbg.png']} alt='' />
                                        <Mutation key={item.userID + '_unfollow'}
                                          mutation={UNFOLLOW_USER}
                                          onCompleted={() => { this.setState({ avatarLoadingId: '' }) }}
                                          onError={() => { this.setState({ avatarLoadingId: '' }) }}
                                          awaitRefetchQueries={true}
                                        >
                                          {
                                            (unfollow, { loading, error, client }) => {
                                              if (error)
                                                this.setState({
                                                  avatarLoadingId: ''
                                                })
                                              return (
                                                <span onClick={e => {
                                                  this.setState({
                                                    avatarLoadingId: item.userID,
                                                  })
                                                  unfollow({
                                                    variables: {
                                                      followUserID: item.userID
                                                    },
                                                    refetchQueries: [`searchUserList`, `queryFriends`]
                                                  })
                                                }}>{intl.messages['friend.unfollow'] || 'Unfollow'}</span>
                                              )
                                            }
                                          }
                                        </Mutation>
                                      </div>
                                    </div>
                                  )

                              }
                            </div>
                          ) : (item.friendshipState === 'FOLLOWER' || item.friendshipState === 'STRANGER') ? (
                            <div>
                              <Mutation
                                key={item.userID + '_follow'}
                                mutation={FOLLOW_USER}
                                onError={() => this.setState({ avatarLoadingId: '' })}
                                onCompleted={() => this.setState({ avatarLoadingId: '' })}
                                awaitRefetchQueries={true}
                              >
                                {
                                  (follow, { loading, error }) => {
                                    return (
                                      <div>
                                        {
                                          ((item.userID === avatarLoadingId) && !error) || loading ? (
                                            //loading
                                            <div className="loading-gray"><img src={images["loading_gray.png"]} alt="load" /></div>
                                          ) : (
                                              <BtnBasic type="small" okText={intl.messages['friend.follow'] || "+Follow"} onClick={async e => {
                                                this.setState({ avatarLoadingId: item.userID })
                                                await follow({
                                                  variables: {
                                                    followUserID: item.userID
                                                  },
                                                  refetchQueries: [`searchUserList`, `queryFriends`]
                                                })
                                              }} />
                                            )}
                                      </div>
                                    )
                                  }
                                }
                              </Mutation>
                            </div>
                          ) : (
                                <>
                                  Our relationship is not defined.
                                </>
                              )
                      }
                    </div>
                  ) : (
                      <>
                      {
                        intl.messages['game.loading'] || 'Loading...'
                      }
                      </>
                    )

                )
              })
            }
            {/* 
            <ImgLoade imgItems={cardList}
              loadedItems={(value) => this.setState({ loadedItems: value })} /> */}
          </div>)
        }
      </GameContext.Consumer>
    )
  }
}

export default injectIntl(BasicCard);
