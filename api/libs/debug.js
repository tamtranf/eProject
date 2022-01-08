const d = require('debug');
const moment = require('moment');
const config = require('../config/default');

const prefix = '';
class Debug {
  create(name, force = false) {
    if (config.debug.flags[name] === true || force === true) {
      const dd = d(`${config.debug.prefix}:${prefix}${name}:`);
      return (...args) => {
        dd(moment().format('MM/DD HH:mm:ss.SSS'), ...args);
      };
    }
    // const dd = d(`${config.debug.prefix}:(disabled)${name}`);
    // eslint-disable-next-line no-unused-vars
    return (...args) => {
      // dd(moment().format('MM/DD HH:mm:ss.SSS'), ...args);
    };
  }
}
module.exports = new Debug();
