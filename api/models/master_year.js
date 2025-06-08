// const uuid = require('uuid');
// const md5 = require('md5');
// const nseq = require('nseq');
// const async = require('async');
// const _ = require('lodash');
// const moment = require('moment');
const debug = require('debug')('MasterYear');
const local_fields = require('../rules/fields_master_year');
const base_model = require('../libs/base_model');
// const login = require('./login');
// const constants = require('../rules/constants');
const DataUtil = require('../libs/data_utils');
const ResponseUtil = require('../libs/response_utils');
// const PrintUtil = require('../libs/print_util');
// const system_setting = require('./system_setting');
// const { lt } = require('lodash');

// const approval_history = {};

class MasterYear extends base_model {
  constructor() {
    super();

    this.id = 'master_year';
    this.table = 'master_year';
    this.form_fields = 'seq_id,year_name,year_code';

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
      get_year_list: {
        method: 'post', func: 'get_year_list', path: '/get_year_list', no_login: false,
      },

    };
    debug('started');
  }

  get_fields() {
    return local_fields;
  }

  get_options_conditions(req, extend = {}) {
    const options = extend;
    const entity = req.local.session_entity;

    if (entity !== 'Super_admin') {
      options.conditions = 'entity_code=?';
      options.params = [entity];
    }
    return options;
  }

  check_pk(mode, changes, req, res, cb) {
    return this.base_check_pk(mode, changes, req, res, {}, cb);
  }

  datasource_load(req, res) {
    this.base_datasource_load(req, res, this.get_options_conditions(req));
  }

  datasource_count(req, res) {
    this.base_datasource_count(req, res, this.get_options_conditions(req));
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

  get_year_list(req, res) {
    DataUtil.query(`SELECT year_code, year_name FROM ${this.table} `, [], {}, (err, result) => {
      if (err) {
        return ResponseUtil.response(req, res, {}, err);
      }
      return ResponseUtil.response(req, res, { list: result }, err);
    });
  }
}

module.exports = new MasterYear();
