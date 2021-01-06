# lilith playerhub.

### scaffold
1. git clone https://github.com/qpjoy/lilith-playerhub
2. npm i create-react-app@3.1.2 -g
3. create-react-app lilith-playerhub
4. cd lilith-playerhub && git add . && git commit -m 'init eject' 
5. rm -rf node_modules
6. mkdir client && mv public scripts yarn.lock config package.json README.md src client/
7. cd client && yarn install

### support sass
1. yarn add node-sass -D

### suport antd
1. yarn add antd

### support rem flexible
1. yarn add amfe-flexible
2. yarn add postcss-pxtorem -D
3. 
```
const sassRegex = /\.(css|scss|sass)$/;
const sassModuleRegex = /\.module\.(css|scss|sass)$/;

pxtorem({
  rootValue: 100,
  propWhiteList: [],
  // unitPrecision: 5,
  // propList: ['*'],
  // selectorBlackList: [],
  // replace: true,
  // mediaQuery: false,
  // minPixelValue: 12
}),
postcssNormalize(),
```

### no compile function names
1. // keep_classnames: true,
2. keep_fnames: true,

### support router
1. yarn add react-router-guard

### import apollo client
1. yarn add apollo-client apollo-cache-inmemory apollo-link-logger apollo-link-context
 apollo-link-http apollo-link apollo-link-error graphql-tag graphql apollo-link-retry react-apollo
 
2. yarn add apollo-cache-persist
 To be continued
 
### service packages
1. yarn add query-string
2. yarn add lodash
 
### deployment
NODE_ENV: k8s passing to env, default development || test || production
PUBLIC_URL: dynamic assets prefix
REACT_APP_API_URL: dynamic api
