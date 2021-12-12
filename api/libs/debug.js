const config = require('../config/default');
const d = require('debug');
const moment = require('moment');
const prefix = '';
class Debug {
  create(name, force = false) {
    if (config.debug.flags[name] == true || force == true) {
      var dd = d(config.debug.prefix + ':' + prefix + name + ':');
      return (...args) => {
        dd(moment().format('MM/DD HH:mm:ss.SSS'), ...args);
      };
    } else {
      var dd = d(config.debug.prefix + ':(disabled)' + name);
      return (...args) => {
        // dd(moment().format('MM/DD HH:mm:ss.SSS'), ...args);
      };
    }
  }
}
module.exports = new Debug();
