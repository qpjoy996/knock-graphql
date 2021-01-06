var userAgent = navigator.userAgent || navigator.vendor || window.opera;

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

function appendIframeWithURL(url) {
  var iframe = document.createElement("IFRAME");
  iframe.setAttribute("src", url);
  document.documentElement.appendChild(iframe);
  iframe.parentNode.removeChild(iframe);
  iframe = null;
}

function sendMessageToUnity(message) {
  if (isIOS()) {
    appendIframeWithURL('inappbrowserbridge://' + message);
  } else if (isAndroid()) {
    console.log(message);
    UnityInAppBrowser.sendMessageFromJS(message);
  }
}

function sendPing() {
  sendMessageToUnity("ping");
}
