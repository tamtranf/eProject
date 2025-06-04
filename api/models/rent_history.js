// const uuid = require('uuid');
// const md5 = require('md5');
// const nseq = require('nseq');
// const async = require('async');
// const _ = require('lodash');
// const moment = require('moment');
const debug = require('debug')('RentHistory');
const local_fields = require('../rules/fields_rent_history');
const base_model = require('../libs/base_model');
// const login = require('./login');
const constants = require('../rules/constants');
const DataUtil = require('../libs/data_utils');
const ResponseUtil = require('../libs/response_utils');
// const PrintUtil = require('../libs/print_util');
// const system_setting = require('./system_setting');
// const { lt } = require('lodash');
const acl_rules = require('../rules/acl_rules');

// const approval_history = {};

class RentHistory extends base_model {
  constructor() {
    super();

    this.id = 'rent_history';
    this.table = 'rent_history';
    this.form_fields = 'seq_id,car_id,entity_code,customer_name,from_date,to_date,total_rent_hours,rent_value,notes';
    this.model_acl = acl_rules.DATA_PAGES;
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
      load_last_open_rent_record: {
        method: 'post', func: 'load_last_open_rent_record', path: '/load_last_open_rent_record', no_login: false,
      },
    };
    debug('started');
  }

  get_fields() {
    return local_fields;
  }

  load_last_open_rent_record(req, res) {
    DataUtil.query(`SELECT *  FROM ${this.table} WHERE car_id = ? AND to_date IS NULL ORDER BY from_date LIMIT 0,1`, [req.body.car_id], {}, (err, result) => {
      if (err) {
        return ResponseUtil.response(req, res, {}, err);
      }
      if (Array.isArray(result) && result.length !== 1) {
        return ResponseUtil.response(req, res, {}, 'Data not found');
      }
      return ResponseUtil.response(req, res, { data: result[0] }, err);
    });
  }

  get_options_conditions(req, extend = {}) {
    const options = extend;
    options.conditions = (options.conditions) ? options.conditions : '';
    options.params = (Array.isArray(options.params)) ? options.params : [];
    const entity = req.local.session_entity;

    if (entity !== 'Super_admin') {
      options.conditions = 'entity_code=?';
      options.params = [entity];
    }
    if (req.body.api_request_options) {
      if (options.conditions && options.conditions.length > 0) {
        options.conditions += 'AND';
      }
      options.conditions += 'car_id=?';
      options.params.push(req.body.api_request_options.car_id);
    }
    return options;
  }

  check_pk(mode, changes, req, res, cb) {
    return this.base_check_pk(mode, changes, req, res, {}, cb);
  }

  datasource_load(req, res) {
    if (this.checkServerAcl(req, res, true, this.aclAction.READ)) {
      this.base_datasource_load(req, res, this.get_options_conditions(req));
    }
  }

  datasource_count(req, res) {
    if (this.checkServerAcl(req, res, true, this.aclAction.READ)) {
      this.base_datasource_count(req, res, this.get_options_conditions(req));
    }
  }

  get(req, res) {
    if (this.checkServerAcl(req, res, true, this.aclAction.READ)) {
      return this.base_get(req, res);
    }
  }

  set(req, res) {
    if (this.checkServerAcl(req, res, true, (req.params.id === constants.IDS.ADD_NEW_RECORD_ID) ? this.aclAction.ADD : this.aclAction.EDIT)) {
    //   const entity = req.local.session_entity;
    //   if (entity !== 'Super_admin' && req.params.id === constants.IDS.ADD_NEW_RECORD_ID) {
    //     req.body.changes.entity_code = entity;
    //   }

      DataUtil.query('Select entity_code,price_per_day from car where seq_id = ?', [req.body.changes.car_id], {}, (err, result) => {
        if (err) {
          return ResponseUtil.error(res, { message: err.message });
        }
        if (result.length === 0) {
          return ResponseUtil.error(res, { message: 'Car not found' });
        }
        req.body.changes.entity_code = result[0].entity_code;
        if (req.params.id !== constants.IDS.ADD_NEW_RECORD_ID) {
          const price_per_hour = result[0].price_per_day / 24;
          req.body.changes.rent_value = price_per_hour * req.body.changes.total_rent_hours;
        }
        const new_status = (req.params.id === constants.IDS.ADD_NEW_RECORD_ID) ? 'Rented' : 'Idle';
        if (req.params.id !== constants.IDS.ADD_NEW_RECORD_ID) {
          const price_per_hour = result[0].price_per_day / 24;
          req.body.changes.rent_value = price_per_hour * req.body.changes.total_rent_hours;
        }
        const sql = 'UPDATE car SET status =? WHERE seq_id=?';
        const params = [new_status, req.body.changes.car_id];
        DataUtil.query(sql, params, {}, (err2, _result) => {
          if (err2) {
            return ResponseUtil.error(res, { message: err2.message });
          }

          this.base_set(req, res, {});
        });
      });
    }
  }

  delete(req, res) {
    if (this.checkServerAcl(req, res, true, this.aclAction.DELETE)) {
      return this.base_delete(req, res);
    }
  }

  delete_arr(req, res) {
    if (this.checkServerAcl(req, res, true, this.aclAction.DELETE)) {
      return this.base_delete_arr(req, res);
    }
  }
}
module.exports = new RentHistory();
