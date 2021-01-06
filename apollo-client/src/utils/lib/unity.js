let userAgent = navigator.userAgent || navigator.vendor || window.opera;

function isIOS() {
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return true;
  } else {
    return false;
  }
}

function isAndroid() {
  return (/android/i.test(userAgent));
}

export function unityJSON(action, json) {
  const strJSON = JSON.stringify(json);
  let jsonArr = [json];
  let jsonArrJSON = JSON.stringify(jsonArr);
  if (isAndroid() || isIOS()) {
    // sendMessageToUnity(`${action}, ["${strJSON}"]`);
    console.log(action, json, ' - - - -!!!');

    window.sendMessageToUnity(`${action}, ${jsonArrJSON}`);
  } else {
    if (window[action] && typeof (window[action]) === 'function') {
      //localStorage.setItem(`_zfb_event_${action}`, window[action])
    }
    if (!window['_zfb_event']) {
      alert('ZFBrowser event is not bounded!');
      return;
    }
    if (!window[action]) {
      if (action === 'userLogin') {
        window[action] = function () {
          window['_zfb_event'](1, JSON.stringify(Array.prototype.slice.call(arguments)));
        }
      } else if (action === 'setAutoLogin') {
        window[action] = function () {
          window['_zfb_event'](9, JSON.stringify(Array.prototype.slice.call(arguments)));
        }
      } else if (action === 'showAvatar') {
        window[action] = function () {
          window['_zfb_event'](17, JSON.stringify(Array.prototype.slice.call(arguments)));
        }
      } else if (action === 'googleAuth') {
        window[action] = function () {
          window['_zfb_event'](21, JSON.stringify(Array.prototype.slice.call(arguments)));
        }
      } else if (action === 'showFloatWeb') {
        window[action] = function () {
          window['_zfb_event'](11, JSON.stringify(Array.prototype.slice.call(arguments)));
        }
      } else {
        let eventNumber = localStorage.getItem(`_zfb_event_${action}`);
        const func = eventNumber && !isNaN(Number(eventNumber)) ? function () {
          window['_zfb_event'](Number(eventNumber), JSON.stringify(Array.prototype.slice.call(arguments)));
        } : undefined
        if (func) {
          console.log('从缓存调用unity函数',action,strJSON)
          func(strJSON, `${action}, ${jsonArrJSON}`)
        } else {
          console.log(`开始搜索函数${action}`)
          let count = 0;
          let timer = setInterval(() => {
            const hasFunc = window[action];
            count += 1;
            if (hasFunc) {
              hasFunc(strJSON, `${action}, ${jsonArrJSON}`)
              clearInterval(timer)
            } else {
              window['_zfb_event'](0, action)
            }
            if (count > 10) {
              console.log(`找不到函数${action}`)
              clearInterval(timer)
            }
          }, 1000)
        }
        return;
      }
    }
    // console.log(window['_zfb_event'], window[action], ' - - - -window???1');
    console.log('调用unity函数',action,strJSON)
    window[action](strJSON, `${action}, ${jsonArrJSON}`);
  }
}

export function zfbNotBind(action) {
  if (action === 'userLogin') {
    window[action] = function () {
      window['_zfb_event'] && window['_zfb_event'](1, JSON.stringify(Array.prototype.slice.call(arguments)));
    }
  }
}

export function unityListen(action, cb) {
  window[action] = cb;
}

export function unityUnlisten(action) {
  window[action] = function () { };
}

export function unityListenAspect(action, {
  listen,
  before,
  after
}) {
  window[action] = listen;
  let native = window[action];

  window[action] = function () {
    before && before(action);
    native.apply(window, arguments);
    after && after(action);
  }
}

export const cacheAllUnityFunctions = (funcArr = []) => {
  setTimeout(() => {
    funcArr.forEach(action => {
      if (typeof (window[action]) === 'function') {
        if (String(window[action]) && String(window[action]).indexOf('_zfb_event(') > -1) {
          const actionNumber = String(window[action]).split('_zfb_event(')[1].split(',')[0]
          if (!isNaN(Number(actionNumber))) {
            localStorage.setItem(`_zfb_event_${action}`, Number(actionNumber))
          }
        }
      }
    })
  }, 2000)
}