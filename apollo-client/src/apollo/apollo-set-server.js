import { ApolloClient } from 'apollo-client';
import { InMemoryCache, defaultDataIdFromObject } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import { setContext } from 'apollo-link-context';
import { RetryLink } from "apollo-link-retry";
import { _isInLocalStorage, _getIn } from "utils";
import { AUTH_TOKEN, PHONE_INFO, PLATFORM } from "utils/constants";
import graph from "./graphql";

const cache = new InMemoryCache({
  dataIdFromObject: object => {
    switch (object.__typename) {
      case 'DisplayUserInfo':
        return object['userID']; // use `key` as the primary key
      case 'DeveloperGameDisplayItem':
        return object['version'];
      case 'TeamMember':
        return object['userID'];
      case 'DisplayDevActivityDetail':
        return object['id'];
      case 'BannerLink':
        return object['bannerID']
      case 'PlayedGame':
        return object['gameID'];
      case 'FavoritedGame':
        return object['gameID'];
      // case 'bar':
      //   return `bar:${object.blah}`; // use `bar` prefix and `blah` as the primary key
      default:
        return defaultDataIdFromObject(object) || `${object.__typename}:${object._id}`; // fall back to default handling
    }
  }
});

// const networkErrorEvent = new CustomEvent('network error');

export function setClient (options) {
  const client = new ApolloClient({
    cache,
    link: ApolloLink.from([
      // logger
      //apolloLogger,
      // error
      onError((error) => {
        const { graphQLErrors, networkError } = error;
        console.log(error, '-  -- this is error');
        if (graphQLErrors) {
          graphQLErrors.map((err) => {
            const errcode = _getIn(err, 'extensions', 'errcode')
            if (errcode) {
              if (errcode === 1029 || errcode === 1028) {
                // AntMessage.error(errorHandler(errcode));
                // window.location.href = '/landing/login'
              }
            }
          })
        }

        if (networkError) {
          // document.dispatchEvent(networkErrorEvent)
          // remove cached token on 401 from the server
          console.log(JSON.stringify(networkError), ' - - - - - resolving network error!', options);
          console.log(networkError.name, ' - - - -  -- -- this is network name!');

          if (networkError.name === 'ServerError' && networkError.statusCode === 401) {
            localStorage.removeItem(AUTH_TOKEN)
          }
        }
      }),
      new RetryLink({
        delay: {
          initial: 300,
          max: Infinity,
          jitter: true
        },
        attempts: (count, operation, error) => {
          console.log(`第${count}次重试${operation.operationName}`)
          return ['QueryTeamInvite', 'QueryTeamInfo'].indexOf(operation.operationName) > -1 ? count < 5 : !!error && count < 6
        }
      }),
      // auth
      setContext((_, { headers }) => {
        let token = _isInLocalStorage(AUTH_TOKEN);
        let _phoneInfo = _isInLocalStorage(PHONE_INFO);
        let platform = options.platform || _isInLocalStorage(PLATFORM)
        let phoneInfo = {};
        if (_phoneInfo) {
          phoneInfo = JSON.parse(_phoneInfo);
        }
        return {
          headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
            "m-login-type": platform ? platform : "unset",
            "m-a-model": phoneInfo.model ? phoneInfo.model : "",
            "m-a-s_v": phoneInfo.s_v ? phoneInfo.s_v : "",
            "m-a-device": phoneInfo.device ? phoneInfo.device : "",
            "m-a-app_v": phoneInfo.app_v ? phoneInfo.app_v : "",
            "m-a-g_aid": phoneInfo.aid ? phoneInfo.aid : ""
          },
        }
      }),
      // new ApolloLink((operation, forward) =>
      //     new Observable(observer => {
      //         let handle;
      //         Promise.resolve(operation)
      //             .then(operation => {
      //                     const request = async (operation) => {
      //                         const token = options.token ? options.token : _isInLocalStorage(AUTH_TOKEN);
      //                         operation.setContext((_, operations) => {
      //                             console.log(_, operations, 'this is inner setContext')
      //                             return {
      //                                 headers: {
      //                                     authorization: token
      //                                 }
      //                             }
      //                         });
      //                     }
      //                 }
      //             )
      //             .then(() => {
      //                 handle = forward(operation).subscribe({
      //                     next: observer.next.bind(observer),
      //                     error: observer.error.bind(observer),
      //                     complete: observer.complete.bind(observer),
      //                 });
      //             })
      //             .catch(observer.error.bind(observer));
      //
      //         return () => {
      //             if (handle) handle.unsubscribe();
      //         };
      //     })
      // ),
      new HttpLink({
        // uri: options.api ? options.api : ''
        uri: options.api ? options.api : '',
        // credentials: 'include'
      })
    ]),
    ...graph
  });
  return client;
}
