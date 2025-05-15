const uuid = require('uuid');
const md5 = require('md5');
// const nseq = require('nseq');
// const async = require('async');
// const _ = require('lodash');
const moment = require('moment');
const debug = require('debug')('Template');
const local_fields = require('../rules/fields_template');
const base_model = require('../libs/base_model');
// const login = require('./login');
// const constants = require('../rules/constants');
const DataUtil = require('../libs/data_utils');
const response_utils = require('../libs/response_utils');
// const ResponseUtil = require('../libs/response_utils');
// const PrintUtil = require('../libs/print_util');
// const system_setting = require('./system_setting');
// const { lt } = require('lodash');

// const approval_history = {};
const HASH_PRIVATE_KEY = '464315b9-4a4b-4b2f-a9e9-52794873744c';

class MasterUser extends base_model {
  constructor() {
    super();

    this.id = 'master_user';
    this.table = 'master_user';
    this.form_fields = 'seq_id,username,password,full_name,last_login,status';
    this.session_ttl = 72 * 60 * 60 * 100;

    this.routes = {
      datasource_load: {
        method: 'post', func: 'datasource_load', path: '/datasource_load/:start/:end', no_login: false,
      },
      datasource_count: {
        method: 'post', func: 'datasource_count', path: '/datasource_count', no_login: false,
      },
      get: {
        method: 'post', func: 'get', path: '/get/:id', no_login: false,
      },
      set: {
        method: 'post', func: 'set', path: '/set/:id', no_login: false,
      },
      delete: {
        method: 'post', func: 'delete', path: '/delete', no_login: false,
      },
      delete_arr: {
        method: 'post', func: 'delete_arr', path: '/delete_arr', no_login: false,
      },
      login: {
        method: 'post', func: 'login', path: '/login', no_login: true,
      },
      logout: {
        method: 'post', func: 'logout', path: '/logout', no_login: true,
      },
    };
    debug('started');
  }

  login(req, res) {
    const params = [
      req.body.username,
      md5(req.body.password),
    ];
    const sql = `SELECT * FROM ${this.table} WHERE username=? AND password=?`;
    DataUtil.query(sql, params, {}, (err, result) => {
      if (err) {
        response_utils.response(req, res, {}, err);
      }
      if (!Array.isArray(result) || result.length === 0) {
        response_utils.response(req, res, { success: true, logged: false, err }, err);
      }
      const row = result[0];
      const data = {
        username: row.username,
        fullname: row.full_name,
        status: row.status,

      };
      if (data.status !== 1) {
        data.logged = false;
        response_utils.response(req, res, { success: true, data, err }, err);
      }
      data.logged = true;
      this.create_cookie(req, res, data);
      return response_utils.response(req, res, data, err);
    });
  }

  logout() {}

  validate() {}

  now() {
    return (new Date()).getTime();
  }

  create_hash(user_name, session_key, full_name, expires_read) {
    return md5(`${HASH_PRIVATE_KEY}_${user_name}_${session_key}_${full_name}_${expires_read}`);
  }

  create_cookie(req, res, user) {
    const expires = this.now() + this.session_ttl;
    const expires_read = moment(expires).format('YYYYMMDDHHmmss');
    const session_key = `${Math.floor(Math.random() * 100000000 + 10000000)}_${uuid.v4()}_${md5(user.username)}`;
    const session_hash = this.create_hash(user.username, session_key, user.full_name, expires_read);
    res.cookie('session_user', user.username, { expires });
    res.cookie('session_full_name', user.full_name, { expires });
    res.cookie('session_expires', expires_read, { expires });
    res.cookie('session_key', session_key, { expires });
    res.session_hash('session_hash', session_hash, { expires });
  }

  destroy_cookie() {}

  get_fields() {
    return local_fields;
  }

  check_pk(mode, changes, req, res, cb) {
    return this.base_check_pk(mode, changes, req, res, {}, cb);
  }

  datasource_load(req, res) {
    this.base_datasource_load(req, res);
  }

  datasource_count(req, res) {
    this.base_datasource_count(req, res);
  }

  get(req, res) {
    return this.base_get(req, res);
  }

  set(req, res) {
    return this.base_set(req, res, {});
  }

  delete(req, res) {
    return this.base_delete(req, res);
  }

  delete_arr(req, res) {
    return this.base_delete_arr(req, res);
  }
}

module.exports = new MasterUser();
