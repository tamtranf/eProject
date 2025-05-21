const uuid = require('uuid');
const md5 = require('md5');
const Nseq = require('nseq');
// const async = require('async');
// const _ = require('lodash');
const moment = require('moment');
const debug = require('debug')('MasterUser');
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
    this.form_fields = 'seq_id,user_name,pass_word,full_name,last_login,status';
    this.session_ttl = 72 * 60 * 60 * 1000;

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
      select_user_entity: {
        method: 'post', func: 'select_user_entity', path: '/select_user_entity', no_login: false,
      },
    };
    debug('started');
  }

  login(req, res) {
    const n = new Nseq();
    let user = null;
    n.do([
      (self) => {
        const params = [
          req.body.user_name,
          md5(req.body.pass_word),
        ];
        const sql = `SELECT * FROM ${this.table} WHERE user_name=? AND pass_word=?`;
        DataUtil.query(sql, params, {}, (err, result) => {
          if (err) {
            return response_utils.response(req, res, {}, err);
          }
          if (!Array.isArray(result) || result.length === 0) {
            return response_utils.response(req, res, { success: true, logged: false, err }, err);
          }

          const row = result[0];
          user = {
            user_name: row.user_name,
            full_name: row.full_name,
            last_login: row.last_login,
            status: row.status,
            is_super_admin: row.is_super_admin,
          };

          if (user.status !== 1) {
            user.logged = false;
            user.success = true;
            return response_utils.response(req, res, user, err);
          }
          user.logged = true;
          user.success = true;
          this.create_cookie(req, res, user);
          self.next();
        });
      },
      () => {
        const params = [user.user_name];
        const sql = 'SELECT p.entity_code, e.entity_name FROM master_user_permission p JOIN master_entity e ON e.entity_code = p.entity_code WHERE p.user_name = ?';
        DataUtil.query(sql, params, {}, (err, result) => {
          if (err) {
            return response_utils.response(req, res, {}, err);
          }
          if (!Array.isArray(result) || result.length === 0) {
            return response_utils.response(req, res, { success: true, logged: false, reason: 'no set permission ' }, err);
          }
          user.entities = result;
          if (user.is_super_admin === 1) {
            user.entities.push({
              entity_code: 'Super_admin',
              entity_name: 'Full access',
            });
          }

          return response_utils.response(req, res, user, err);
        });
      },
    ]);
  }

  logout(req, res) {
    this.destroy_cookie(req, res);
    return response_utils.response(req, res, {});
  }

  validate(req, res, cb) {
    const {
      session_key, session_user, session_full_name, session_expires, session_hash, session_entity,
    } = req.cookies;
    const session_read = moment(this.now()).format('YYYYMMDDHHmmss');
    if (typeof session_expires === 'undefined' || parseInt(session_read) > parseInt(session_expires)) {
      this.destroy_cookie(req, res);
      return cb(false);
    }
    const test_hash = this.create_hash(session_user, session_key, session_full_name, session_expires, session_entity);
    if (test_hash === session_hash) {
      if (typeof req.local === 'undefined') {
        req.local = {};
      }
      req.local.session_user = session_user;
      req.local.session_full_name = session_full_name;
      req.local.session_entity = session_entity;
      return cb(true);
    }
    this.destroy_cookie(req, res);
    return cb(false);
  }

  now() {
    return (new Date()).getTime();
  }

  create_hash(user_name, session_key, full_name, expires_read, session_entity) {
    return md5(`${HASH_PRIVATE_KEY}_${user_name}_${session_key}_${full_name}_${expires_read}_${session_entity}`);
  }

  create_cookie(req, res, user) {
    const expires = new Date(this.now() + this.session_ttl);
    const expires_read = moment(expires).format('YYYYMMDDHHmmss');
    const session_key = `${Math.floor(Math.random() * 100000000 + 10000000)}_${uuid.v4()}_${md5(user.user_name)}`;
    const session_entity = user.selectedEntity || '';
    console.log('sessionentiy------------');
    console.log(session_entity);
    const session_hash = this.create_hash(user.user_name, session_key, user.full_name, expires_read, session_entity);

    res.cookie('session_user', user.user_name, { expires });
    res.cookie('session_full_name', user.full_name, { expires });
    res.cookie('session_expires', expires_read, { expires });
    res.cookie('session_key', session_key, { expires });
    res.cookie('session_hash', session_hash, { expires });
    res.cookie('session_entity', session_entity, { expires });
  }

  destroy_cookie(req, res) {
    const session_expires = new Date(this.now() + this.session_ttl);
    res.cookie('session_user', '', { session_expires });
    res.cookie('session_full_name', '', { session_expires });
    res.cookie('session_expires', '', { session_expires });
    res.cookie('session_key', '', { session_expires });
    res.cookie('session_hash', '', { session_expires });
    res.cookie('session_entity', '', { session_expires });
  }

  select_user_entity(req, res) {
    if (req.body.selectedEntity === 'Super_admin') {
      const params = [req.local.session_user];
      const sql = `SELECT * FROM ${this.table} WHERE user_name=? AND is_super_admin=1`;
      DataUtil.query(sql, params, {}, (err, result) => {
        if (err) {
          return response_utils.response(req, res, {}, err);
        }
        if (!Array.isArray(result) || result.length === 0) {
          return response_utils.response(req, res, { success: true, logged: false, err }, err);
        }
        const data = {
          user_name: req.local.session_user,
          full_name: req.local.session_full_name,
          selectedEntity: 'Super_admin',
        };
        console.log(data);
        this.create_cookie(req, res, data);

        return response_utils.response(req, res, { success: true, logged: true }, err);
      });
    } else {
      const params = [req.local.session_user, req.body.selectedEntity];
      console.log('^^^^^^^^^^^^^');
      console.log(params);
      const sql = 'SELECT p.entity_code FROM master_user_permission p JOIN master_entity e ON e.entity_code = p.entity_code WHERE p.user_name = ? and p.entity_code = ?';
      DataUtil.query(sql, params, {}, (err, result) => {
        if (err) {
          return response_utils.response(req, res, {}, err);
        }
        if (!Array.isArray(result) || result.length === 0) {
          return response_utils.response(req, res, { success: true, logged: false, err }, err);
        }
        const data = {
          user_name: req.local.session_user,
          full_name: req.local.session_full_name,
          selectedEntity: result[0].entity_code,
        };
        this.create_cookie(req, res, data);

        return response_utils.response(req, res, { success: true, logged: true }, err);
      });
    }
  }

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
