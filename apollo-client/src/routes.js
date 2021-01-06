import React from 'react';
import { dynamicWrapper } from 'react-router-guard';

const routes = [
  {
    path: '/',
    exact: true,
    redirect: '/new-landing/land'
  },
  {
    path: '/new-landing',
    component: dynamicWrapper(() => import('components/pages/land/device-landing')),
    routes: [
      {
        path: '/new-landing/land',
        exact: true,
        component: dynamicWrapper(() => import('components/pages/land/device-landing/LandDevice'))
      },
      {
        path: '/new-landing/set-nickname',
        exact: true,
        component: dynamicWrapper(() => import('components/pages/land/device-landing/SetNickName'))
      }
    ]
  },
  {
    path: '/google-landing',
    component: dynamicWrapper(() => import('components/pages/land/google-landing')),
    routes: [
      {
        path: '/google-landing/land',
        exact: true,
        component: dynamicWrapper(() => import('components/pages/land/google-landing/LandGoogle'))
      },
      {
        path: '/google-landing/set-nickname',
        exact: true,
        component: dynamicWrapper(() => import('components/pages/land/google-landing/SetNickName'))
      }
    ]
  },
  {
    path: '/lilith-landing',
    component: dynamicWrapper(() => import('components/pages/land/lilith-landing')),
    routes: [
      {
        path: '/lilith-landing/land',
        exact: true,
        component: dynamicWrapper(() => import('components/pages/land/lilith-landing/LandLilith'))
      },
      {
        path: '/lilith-landing/set-nickname',
        exact: true,
        component: dynamicWrapper(() => import('components/pages/land/lilith-landing/SetNickName'))
      }
    ]
  },
  {
    path: '/i18n',
    component: dynamicWrapper(() => import('components/pages/i18n')),
    routes: [
      {
        path: '/i18n/messages',
        exact: true,
        component: dynamicWrapper(() => import('components/pages/i18n/Messages'))
      }
    ]
  },
  {
    path: '/home',
    component: dynamicWrapper(() => import('components/pages/home/google-home')),
    routes: [
      {
        path: '/home/games',
        exact: true,
        component: dynamicWrapper(() => import('components/pages/home/google-home/GameListNew'))
      },
      {
        path: '/home/games/:id/:type?',
        exact: true,
        component: dynamicWrapper(() => import('components/pages/home/google-home/GameDetail'))
      },
      {
        path: '/home/gameList',
        exact: true,
        component: dynamicWrapper(() => import('components/pages/home/google-home/GameListNewTab'))
      }
    ]
  },
  {
    path: '/user',
    component: dynamicWrapper(() => import('components/pages/friend')),
    routes: [
      {
        path: '/user/friends',
        exact: true,
        component: dynamicWrapper(() => import('components/pages/friend/Friends'))
      }
    ]
  },
  {
    path: '/landing',
    component: dynamicWrapper(() => import('components-lobby/pages/land/edit-landing')),
    routes: [
      {
        path: '/landing/login',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/land/edit-landing/Login'))
      },
      {
        path: '/landing/sms',
        exact: true,
        // guardData: {ttt: 'ttt1'},
        component: dynamicWrapper(() => import('components-lobby/pages/land/edit-landing/RegisterSMS'))
      },
      {
        path: '/landing/email',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/land/edit-landing/RegisterEmail'))
      },
      {
        path: '/landing/set-password',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/land/edit-landing/SetPassword'))
      },
      {
        path: '/landing/set-birthday',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/land/edit-landing/SetBirthday'))
      },
      {
        path: '/landing/set-gender',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/land/edit-landing/SetGender'))
      },
      {
        path: '/landing/set-nickname',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/land/edit-landing/SetNickname'))
      },
      {
        path: '/landing/get-phone-code',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/land/edit-landing/forget-password/GetPhoneCode.js'))
      },
      {
        path: '/landing/verify-phone-code',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/land/edit-landing/forget-password/VerifyPhoneCode.js'))
      },
      {
        path: '/landing/get-email-code',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/land/edit-landing/forget-password/GetEmailCode.js'))
      },
      {
        path: '/landing/verify-email-code',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/land/edit-landing/forget-password/VerifyEmailCode.js'))
      },
      {
        path: '/landing/reset-password',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/land/edit-landing/forget-password/NewPassword.js'))
      }
    ]
  },
  {
    path: '/mart',
    component: dynamicWrapper(() => import('components-lobby/pages/mart')),
    routes: [
      {
        path: '/mart/assets',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/mart/Mart'))
      },
      {
        path: '/mart/assets/:id',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/mart/AssetDetail'))
      }
    ]
  },
  {
    path: '/mart-max',
    component: dynamicWrapper(() => import('components-lobby/pages/mart-max')),
    routes: [
      {
        path: '/mart-max/assets',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/mart-max/MartMax'))
      }
    ]
  },
  {
    path: '/my',
    component: dynamicWrapper(() => import('components-lobby/pages/my')),
    routes: [
      {
        path: '/my/games',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/my/MyGame'))
      },
      {
        path: '/my/letsPlayGame',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/my/LetsPlayGame'))
      },
      {
        path: '/my/auditSubmit',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/my/AuditSubmit'))
      },
      {
        path: '/my/gameBanner',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/my/GameBanner'))
      },
      {
        path: '/my/gameDownLoad',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/my/GameDownLoad'))
      }
    ]
  },
  {
    path: '/disk',
    component: dynamicWrapper(() => import('components-lobby/pages/disk')),
    routes: [
      {
        path: '/disk/home',
        exact: true,
        component: dynamicWrapper(() => import('components-lobby/pages/disk/Home'))
      }
    ]
  },
  {
    path: '*',
    component: dynamicWrapper(() => import('components/pages/404/NotFound'))
  }
]

export {
  routes as default
}

