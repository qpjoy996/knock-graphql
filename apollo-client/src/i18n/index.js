// import * as en from 'i18n/en_US';
// import * as en_code from 'i18n/en_US/code.json';
// import * as zh from 'i18n/zh_CN';
// import * as zh_code from 'i18n/zh_CN/code.json';
// en: Object.assign({}, en.default, en_code.default),
// zh: Object.assign({}, zh.default, zh_code.default)

import {merge} from 'lodash';

const en_US = require('i18n/en_US/index.json');
const en_code = require('i18n/en_US/code.json');
const en_page = require('i18n/en_US/page.json');
const en_locale = require('i18n/en_US/locale.json');
const zh = require('i18n/zh_CN/index.json');
const zh_code = require('i18n/zh_CN/code.json');
const zh_page = require('i18n/zh_CN/page.json');
const zh_locale = require('i18n/zh_CN/locale.json');

export default {
  en: merge(en_US, en_code, en_page, en_locale),
  zh: merge(zh, zh_code, zh_page, zh_locale)
}
