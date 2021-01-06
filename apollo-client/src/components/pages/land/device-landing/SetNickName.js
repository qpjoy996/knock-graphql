import React from 'react';
import {Query} from 'react-apollo';
import {GET_MYSELF_AVATAR} from "apollo/graphql/gql";
import EditNickName from "./EditNickName";

class SetNickName extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    return (
      <Query query={GET_MYSELF_AVATAR}>
        {
          ({data, loading, error}) => {
            if (loading) return 'Loading...'
            if (error) return 'Error...'
            if (data.userInfo) {
              return (
                <EditNickName userInfo={{
                  ...data.userInfo
                }}
                              originalNickname={data.userInfo.nickname || ''}
                />
              )
            } else {
              return (
                <div>
                  Rendering nickname...
                </div>
              )
            }
          }
        }
      </Query>
    )
  }
}

export default SetNickName;
