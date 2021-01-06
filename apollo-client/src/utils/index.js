import { isNil } from 'lodash';
import { ACCOUNT, AUTH_TOKEN, PLATFORM, QS_STRING, SCHEMA_INFORMATION } from "./constants";
import { CachePersistor } from 'apollo-cache-persist';
import { history } from 'react-router-guard'
import { unityJSON } from "utils/lib/unity";
import i18n from "i18n/index.js";
import { SERVER } from "states/APP_STATE";
import { createIntl } from 'react-intl';
const locale = ((SERVER === 'prod' || SERVER === 'local' || SERVER === 'dev' || SERVER === 'approval' || SERVER === 'alpha') ? 'zh' : 'en');
const messages = i18n[locale]
const intl = createIntl({
  locale,
  messages
})

export const importAll = result => {
  let images = {};
  result.keys().map((item, index) => {
    return (images[item.replace("./", "")] = result(item));
  });
  return images;
}

export const _isNil = (nil) => {
  return isNil(nil);
}

export const _isTrueText = (text) => {
  if (/true/.test(text)) {
    return true;
  } else if (/false/.test(text)) {
    return false;
  }
}

export const _navigate = (url, unityString, unityParam) => {
  const isWindows = navigator.platform.startsWith('Win')
  if (!unityString) {
    history.push(url)
    return
  }
  if (isWindows) {
    history.push(url)
  } else {
    //alert(JSON.stringify(history))
    // 如果在好友列表先做back处理
    if (history.location.pathname === '/user/friends' || history.location.pathname === '/home/games') {
      unityJSON('back', {})
    }
    // alert(unityString + JSON.stringify(unityParam))
    unityJSON(unityString, unityParam)
  }
}

export const _getIn = (obj, ...restParams) => {
  if (typeof (obj) === 'undefined') {
    return null
  }
  const validateObj = (object, key) => {
    return ['undefined'].indexOf(typeof (object[key])) === -1 ? object[key] : null
  }
  const paramLen = restParams.length
  let currentIndex = 0,
    currentVal = validateObj(obj, restParams[currentIndex])

  while (currentVal !== null) {
    // 如果已经是最后一层结构，直接返回
    if (currentIndex === paramLen - 1) {
      return currentVal
    }
    // 如果不是最后一层且值存在，进行深层判断
    if (currentVal !== null) {
      currentIndex++
      currentVal = validateObj(currentVal, restParams[currentIndex])
    } else {
      return null
    }
  }
}

export const enableDrag = ele => {
  if (ele) {
    document.addEventListener('resize', () => {
      console.log('resize')
      enableDrag(ele)
    })
    ele.parentNode.style.position = "relative"
    ele.style.position = "absolute";
    ele.style.top = "0";
    ele.style.left = "0"
    const { width } = ele.getBoundingClientRect()
    const parentWidth = ele.parentNode.getBoundingClientRect().width
    const offsetWidth = parentWidth - width
    const closeDragElement = (e) => {
      document.onmousemove = null
    }
    if (offsetWidth > 0) {
      closeDragElement()
      return
    }
    ele.style.cursor = 'move'
    ele.onmousedown = (e) => {
      e = e || window.event;
      e.preventDefault();
      const originX = e.clientX;
      const currentLeft = Number(ele.style.left.substr(0, ele.style.left.length - 2))
      document.onmousemove = ev => {
        ev = ev || window.event;
        ev.preventDefault()
        let newLeft = ev.clientX - originX + currentLeft;

        if (newLeft < offsetWidth) {
          newLeft = offsetWidth
        }
        if (newLeft > 0) {
          newLeft = 0
        }
        ele.style.left = `${newLeft}px`;
      };
      document.onmouseup = closeDragElement;
    }
  }
}

export const _historyHandler = (options) => {
  if (!options) {
    return;
  }

  if (options.jump) {
    return options.history.push(options.jump);
  }

  if (options.step === 'last') {
    options.history.goBack();
  } else if (options.step === 'next') {
    options.history.goForward();
  }
}

export const errorHandler = ({
  error,
  mapping
}) => {
  if (error.graphQLErrors) {
    console.log(error.graphQLErrors, ' - -  -')
    let errorMsg = '';
    for (let i = 0; i < error.graphQLErrors.length; i++) {
      let err = error.graphQLErrors[i];
      if (err.extensions && err.extensions.errcode) {
        const errcode = err.extensions.errcode;
        if (mapping) {
          errorMsg = mapping[errcode];
          break;
        }
      }
    }
    return errorMsg;
  }
}


export const setStateAsync = (state, context) => {
  return new Promise((resolve) => {
    context.setState(state, resolve)
  });
}

export const _persistCache = async (client) => {
  try {
    const SCHEMA_VERSION_KEY = SCHEMA_INFORMATION.key;
    const SCHEMA_VERSION = SCHEMA_INFORMATION.version;
    const persistor = new CachePersistor({
      cache: client.cache,
      storage: window.localStorage
    });
    const currentVersion = localStorage.getItem(SCHEMA_VERSION_KEY);
    if (currentVersion === SCHEMA_VERSION) {
      await persistor.restore();

      let APOLLO_CACHE_PERSIST = localStorage.getItem('apollo-cache-persist');
      if (APOLLO_CACHE_PERSIST) {
        let cacheDate = JSON.parse(APOLLO_CACHE_PERSIST)
        client.cache.restore(cacheDate);
      } else {
        await persistor.purge();
      }
    } else {
      await persistor.purge();
      localStorage.setItem(SCHEMA_VERSION_KEY, SCHEMA_VERSION);
      client.writeData({
        data: {
          loginLoading: 'no',
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
          },
          // searchUserList: [DisplayUserinfo!]
        }
      });
    }
  } catch (e) {
    console.log(`Persist cache error!`)
  }
}

export const _isInLocalStorage = (key) => {
  let val = localStorage.getItem(key);
  if ((!!val && val != 'null' && val != 'undefined') || val == 0 || val == false) {
    return val;
  } else {
    return ''
  }
}

export const setQS = (QSString) => {
  // set QSString
  localStorage.setItem(QS_STRING, QSString);

  let platform;
  if (QSString && QSString != 'null') {
    try {
      let QS = JSON.parse(QSString);
      let isPlayerhub = QS['playerhub'];
      let account = QS['account'];
      let token = QS['token'];
      if (account) {
        localStorage.setItem(ACCOUNT, account);
      }
      if (token) {
        localStorage.setItem(AUTH_TOKEN, token);
      }
      if (isPlayerhub) {
        localStorage.setItem(QS_STRING, QSString);

        _isTrueText(isPlayerhub) === true ? platform = 'playerhub' :
          _isTrueText(isPlayerhub) === false ? platform = 'editor' :
            platform = 'web'
      } else {
        let localPlatform = localStorage.getItem(PLATFORM);
        if (localPlatform && localPlatform != 'null' && localPlatform != 'undefined') {
          platform = localPlatform
        } else {
          platform = 'web';
        }
      }
      localStorage.setItem(PLATFORM, platform);
      QS.platform = platform;
      return QS;
    } catch (e) {
      alert('Parse QSString error!')
      return {};
    }
  } else {
    alert('Platform set error!');
    return {}
  }
}

export const getQS = () => {
  let QSString = _isInLocalStorage(QS_STRING);
  if (QSString) {
    return setQS(QSString);
  } else {
    return {};
  }
}

// 字符串长度
export const charCodeLen = (str) => {
  let len = 0, charCode = -1;
  for (let i = 0; i < str.length; i++) {
    charCode = str.charCodeAt(i);
    if (charCode >= 0 && charCode <= 128) len += 1;
    else len += 2;
  }
  return len;
}

// export const getCachedImg = (src) => {
//   const storedImg = localStorage.getItem(src)
//   if (storedImg) {
//     console.log('从缓存中读取图片：' + src)
//     return storedImg
//   }
//   let img = new Image();
//   let canvas = document.createElement('canvas'),
//     ctx = canvas.getContext("2d");
//   img.src = src;
//   img.crossOrigin = "Anonymous";
//   img.onload = function () {
//     canvas.width = img.width;
//     canvas.height = img.height;
//     ctx.drawImage(img, 0, 0);
//     try {
//       const base64Img = canvas.toDataURL("image/png");
//       localStorage.setItem(src, base64Img);
//       console.log('写入图片缓存成功')
//     } catch (err) {
//       console.log('服务端未开启跨域' + err)
//       return src
//     }
//   }
//   return src
// }

export const cacheImage = (src) => {
  if (src) {
    let localList = localStorage.getItem('cacheImgList') ? localStorage.getItem('cacheImgList').split(',') : [];
    if (localList.find(i => i === src)) {
      return src
    }
    localList.push(src);
    localStorage.setItem('cacheImgList', localList.join(','))
  }
  return src
}

export const dateFormat = (fmt, date) => {
  // fmt: yyyy-/MM-/dd hh:mm:ss
  // data: new data(value)
  var o = {
    "M+": date.getMonth() + 1, //月份 
    "d+": date.getDate(),      //日 
    "h+": date.getHours(),     //小时 
    "m+": date.getMinutes(),   //分 
    "s+": date.getSeconds(),   //秒 
    "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
    "S": date.getMilliseconds()    //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
  return fmt;
}

export const judgeTimeGap = (date) => {
  if (!date) {
    return ''
  }
  const gap = (new Date().getTime() - new Date(date).getTime()) / 1000
  if (gap < 60) {
    return messages['time.just_now']
  } else if (gap >= 60 && gap <= 60 * 60) {
    return intl.formatMessage({ id: 'time.minutes_ago', defaultMessage: messages["time.minutes_ago"] }, { minutes: parseInt(gap / 60) })
  } else {
    // 24小时以内
    if (gap < 60 * 60 * 24) {
      // 今天
      if (new Date(date).getDate() === new Date().getDate()) {
        return intl.formatMessage({ id: 'time.hours_ago', defaultMessage: messages["time.hours_ago"] }, { hours: parseInt(gap / (60 * 60)) })
      } else {
        return messages['time.yesterday']
      }
    } else {
      if (gap < 60 * 60 * 24 * 7) {
        return intl.formatMessage({ id: 'time.days_ago', defaultMessage: messages["time.days_ago"] }, { days: parseInt(gap / (60 * 60 * 24)) })
      } else {
        return dateFormat('yyyy / MM / dd', new Date(date))
      }
    }
  }
}

// 数组对象去重
export const uniqueArray = (arr) => {
  let unique = {};
  arr.forEach(function (item) {
    unique[JSON.stringify(item)] = item;
  })
  arr = Object.keys(unique).map(function (u) {
    return JSON.parse(u);
  })
  return arr;
}

export const getImg = (src) => {
  const imgContext = require.context("@/assets/img/basic", true);

  const imgIndex = imgContext
    .keys()
    .findIndex((path) => path === `./${src}`);
  if (imgIndex === -1) {
    return ''
  }
  return imgContext([imgContext.keys()[imgIndex]]);
};