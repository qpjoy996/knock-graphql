const landing = {
  defaults: {
    loginLoading: 'no',
  },
  resolvers: {
    Query: {},
    Mutation: {
      setLoginLoading: (_, {loginLoading}, {cache}) => {
        cache.writeData({
          data: {
            loginLoading
          }
        });
        return null;
      }
    }
  },
}

export default landing;
