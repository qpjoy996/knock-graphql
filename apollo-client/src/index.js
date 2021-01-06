// polyfill es5 es6
import "core-js/stable";
import "unfetch/polyfill";
// react 
import React from 'react';
//fastClick
import FastClick from 'react-fastclick-alt';
import ReactDOM from 'react-dom';
// style
import "antd/dist/antd.css";
import "assets-lobby/sass/main.scss";
import "assets/sass/main.scss";
// custom
import Platform from "./Platform";
import "utils/lib/amfe-flexible";
import { getChannel } from "utils/lib/qt";
import { unityJSON, unityListen } from "utils/lib/unity";
import { IS_RELEASE, PUBLIC_URL, SERVER } from "states/APP_STATE";
import { PlatformProvider } from "states/context/PlatformContext";
// libs
import * as serviceWorker from './serviceWorker';
import * as Sentry from '@sentry/browser';
import loadFont from 'utils/loadFont';

console.log('App is running in env: ', SERVER);

// RELEASE (show vconsole)
if (IS_RELEASE) {
  console.log('You are in release version...');
  Sentry.init({
    dsn: "https://b4b2e9ce598c4340b9c8284282374042@davinci-sentry.lilithgames.com/5",
    environment: 'oversea'
  });
} else if (SERVER === 'local' || SERVER === 'alpha' || SERVER === 'dev' || SERVER === 'oversea-test') {
  console.log('You are in local or dev');
  const VConsole = require('vconsole');
  new VConsole();
} else {
  console.log('Not release, not local');
  Sentry.init({
    dsn: "https://b4b2e9ce598c4340b9c8284282374042@davinci-sentry.lilithgames.com/5",
    environment: SERVER
  });
}

// mobile press back
unityListen('onBackPressed', function () {
  unityJSON('back', {});
});

// initialize qt..
if (window.qt && window.QWebChannel) {
  console.log('Initializing QT Web ...');
  getChannel().then(dt => {
    window.qtJSON = function ({ type, name, cb }) {
      if (type === 'on') {
        window.core && window.core[name].connect(cb);
      } else if (type === 'emit') {
        if(cb) {
          window.core && window.core[name](cb());
        }else {
          window.core && window.core[name]();
        }
      } 
    }
  })
}

// 图片预加载
const cacheImgList = localStorage.getItem('cacheImgList')
if (cacheImgList) {
  console.log('预加载缓存图片')
  cacheImgList.split(',').forEach(src => {
    new Image().src = src
  })
}

console.log('loading fonts');
localStorage.setItem('if-console', SERVER);
loadFont({
  cssValue: 'fblack',
  url: `${PUBLIC_URL}/static/font/FZY4JW.TTF`,
})
loadFont({
  cssValue: 'yblack',
  url: `${PUBLIC_URL}/static/font/FZY4JW.TTF`,
})
loadFont({
  cssValue: 'xingyan',
  url: `${PUBLIC_URL}/static/font/FZY4JW.TTF`,
})

ReactDOM.render(
  <FastClick>
    <PlatformProvider>
      <Platform />
    </PlatformProvider>
  </FastClick>
  , document.getElementById('root'));
serviceWorker.unregister();
