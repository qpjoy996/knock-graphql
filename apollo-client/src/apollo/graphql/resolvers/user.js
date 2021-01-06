import {fragments} from "../gql";

const user = {
  defaults: {
    userInfo: {
      userID: '',
      nickname: '',
      nameSeq: '',
      gender: '',
      hasAvatar: '',
      avatarJSON: '',
      status: '',
      gameID: '',
      gameName: '',
      iconURL: '',
      avatarBodyURL: '',
      profile: '',
      followingCount: '',
      followerCount: '',
      friendshipState: '',
      __typename: 'userInfo'
    }
  },
  resolvers: {
    Query: {},
    Mutation: {
      updateSearchUser: (_, variables, {cache, getCachekey}) => {
        const id = getCachekey({
          __typename: 'DisplayUserInfo',
          id: variables.userID
        })
        const fragment = fragments.login.userInfo;
        const searchUser = cache.readFragment({fragment, id});
        const data = {
          ...searchUser, friendshipState: 'what the f'
        }
        cache.writeData({
          id,
          data
        })
        return null;
      },
      toggleUserStatus: (_, variables, {cache, getCachekey}) => {
        const id = getCachekey({
          __typename: 'DisplayUserInfo',
          id: variables.id
        })

        const fragment = fragments.login.userInfo;
        const user = cache.readFragment({
          fragment,
          id
        });
        const data = {
          ...user,
          helloworld: 'wangwangwang'
        };
        cache.writeData({
          id,
          data
        });
        return null;
      }
    }
  },
}

export default user;
