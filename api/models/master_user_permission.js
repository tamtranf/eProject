// const uuid = require('uuid');
// const md5 = require('md5');
// const nseq = require('nseq');
// const async = require('async');
// const _ = require('lodash');
// const moment = require('moment');
const debug = require('debug')('MasterUserPermission');
const { result } = require('lodash');
const local_fields = require('../rules/fields_master_use_permission');
const base_model = require('../libs/base_model');
// const login = require('./login');
const constants = require('../rules/constants');
const DataUtil = require('../libs/data_utils');
const ResponseUtil = require('../libs/response_utils');
// const PrintUtil = require('../libs/print_util');
// const system_setting = require('./system_setting');
// const { lt } = require('lodash');

// const approval_history = {};

class MasterUserPermission extends base_model {
  constructor() {
    super();

    this.id = 'master_user_permission';
    this.table = 'master_user_permission';
    this.form_fields = 'seq_id,user_name,entity_code,acl_role';
    this.view_fields = `${this.form_fields},entity_name,full_name`;

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
    };
    debug('started');
  }

  get_fields() {
    return local_fields;
  }

  //   get_options_conditions(req, extend = {}) {
  //     const options = extend;
  //     const entity = req.local.session_entity;

  //     if (entity !== 'Super_admin') {
  //       options.conditions = 'entity_code=?';
  //       options.params = [entity];
  //     }
  //     return options;
  //   }

  check_pk(mode, changes, req, res, cb) {
    return this.base_check_pk(mode, changes, req, res, {}, cb);
  }

  datasource_load(req, res) {
    this.base_datasource_load(req, res, { force_fields: this.view_fields, table: 'v_master_user_permission' });
  }

  datasource_count(req, res) {
    this.base_datasource_count(req, res, { force_fields: this.view_fields, table: 'v_master_user_permission' });
  }

  get(req, res) {
    return this.base_get(req, res, { force_fields: this.view_fields, table: 'v_master_user_permission' });
  }

  set(req, res) {
    const params = [req.body.changes.user_name, req.body.changes.entity_code];
    let sql = `SELECT * FROM ${this.table} WHERE user_name = ? AND entity_code = ?`;
    if (req.params.id !== constants.IDS.ADD_NEW_RECORD_ID) {
      params.push(req.params.id);
      sql += ' AND seq_id != ?';
    }
    DataUtil.query(sql, params, {}, (err, rows) => {
      if (err) {
        return ResponseUtil.response(req, res, {}, err);
      }
      if (Array.isArray(rows) && rows.length > 0) {
        return ResponseUtil.response(req, res, {}, 'Data already exists');
      }
      return this.base_set(req, res, {});
    });
  }

  delete(req, res) {
    return this.base_delete(req, res);
  }

  delete_arr(req, res) {
    return this.base_delete_arr(req, res);
  }
}

module.exports = new MasterUserPermission();
