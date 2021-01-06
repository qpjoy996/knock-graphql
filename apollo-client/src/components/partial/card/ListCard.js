import React from 'react';
import { importAll } from "utils";
import BasicCard from 'components/partial/card/BasicCard'
import { Query } from 'react-apollo';
import { QUERY_FRIENDS } from "../../../apollo/graphql/gql";
import { errorHandler } from "../../../utils";
import { PlatformContext } from "../../../states/context/PlatformContext";
import FriendCardContext from '@/states/context/FriendCardContext'


class ListCard extends React.Component {
  static contextType = PlatformContext;

  render() {
    const webpackContext = require.context('assets/img/basic', false, /\.(png|jpe?g|svg)$/);
    const images = importAll(webpackContext);
    const { typ, invited } = this.props;
    let platformContext = this.context;
    let i18nMapping = platformContext.i18nConfig;
    let variables = {
      typ,
      skipLen: 0,
      limitLen: 1000,
      status: 'ONLINE',
      status1: 'OFFLINE'
    }

    return (
      <FriendCardContext.Consumer>
        {({ _setState, refetchFriends }) => (
          <div className="card-list">
            <Query query={QUERY_FRIENDS}
              fetchPolicy={'network-only'}
              variables={
                variables
              }
            >

              {
                ({ loading, error, data, refetch }) => {
                  // 提供refetch
                  if (!refetchFriends) {
                    console.log('set refetch')
                    _setState({ refetchFriends: refetch })
                  }
                  if (loading) {
                    return (
                      <div className="data-loading client-loading"></div>
                    )
                  }
                  if (error) {
                    console.log(error);
                    return (
                      <div className="card-list-nothing" onClick={() => {
                        refetch();
                      }}>
                        {/* <img src={images['Pic_nothing_suit.png']} /> */}
                        <div className="img" style={{ backgroundImage: `url(${images['Pic_nothing_suit.png']})` }}></div>
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

                  if ((data.online && data.online.length) || (data.offline && data.offline.length)) {
                    let online = data.online;
                    let offline = data.offline;
                    return (
                      <div>
                        <div className="card-list-online">
                          <p className="card-list-online-title">Online ({online.length})</p>
                          <BasicCard key={'online'} cardList={online} isOnline={true} invited={!!invited} />
                        </div>
                        <div className="card-list-online">
                          <p className="card-list-online-title">Offline ({offline.length})</p>
                          <BasicCard key={'offline'} cardList={offline} isOnline={false} invited={!!invited} />
                        </div>
                      </div>
                    )
                  } else {
                    return (
                      <div className="card-list-nothing">
                        <div className="img" style={{ backgroundImage: `url(${images['Pic_nothing_suit.png']})` }}></div>
                        <p>No Player Here</p>
                      </div>
                    )
                  }
                }
              }
            </Query>
          </div>
        )}
      </FriendCardContext.Consumer>
    )
  }
}

export default ListCard;
