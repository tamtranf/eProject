// const uuid = require('uuid');
// const md5 = require('md5');
// const nseq = require('nseq');
// const async = require('async');
// const _ = require('lodash');
const moment = require('moment');
const debug = require('debug')('Car');
const local_fields = require('../rules/fields_car');
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

class Car extends base_model {
  constructor() {
    super();

    this.id = 'car';
    this.table = 'car';
    this.form_fields = 'seq_id,maker,model,license_plate,car_year,color,passenger,category,weight,price_per_day,status,notes,entity_code';
    this.view_fields = `${this.form_fields},entity_name,year_name,color_name,category_name,maker_name`;
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
    if (this.checkServerAcl(req, res, true, this.aclAction.READ)) {
      this.base_datasource_load(req, res, this.get_options_conditions(req, { force_fields: this.view_fields, table: 'v_car' }));
    }
  }

  datasource_count(req, res) {
    if (this.checkServerAcl(req, res, true, this.aclAction.READ)) {
      this.base_datasource_count(req, res, this.get_options_conditions(req, { force_fields: this.view_fields, table: 'v_car' }));
    }
  }

  get(req, res) {
    if (this.checkServerAcl(req, res, true, this.aclAction.READ)) {
      return this.base_get(req, res, { force_fields: this.view_fields, table: 'v_car' });
    }
  }

  next_car_id(req, res, connection, cb) {
    const date_code = moment(new Date()).format('YYYYMMDD');
    const sql = `SELECT code_id FROM car WHERE code_id LIKE 'C${date_code}%' ORDER BY code_id DESC LIMIT 1`;

    DataUtil.query(sql, [], { connection }, (err, result) => {
      if (err) {
        return cb(err);
      }

      if (result.length === 0) {
        return cb(null, `C${date_code}0001`);
      }

      const last_id = result[0].code_id.replace(`C${date_code}`, '');
      const new_id = parseInt(last_id) + 1;
      return cb(null, `C${date_code}${new_id.toString().padStart(4, '0')}`);
    });
  }

  set(req, res) {
    const isNew = req.params.id === constants.IDS.ADD_NEW_RECORD_ID;

    if (this.checkServerAcl(req, res, true, isNew ? this.aclAction.ADD : this.aclAction.EDIT)) {
      const entity = req.local.session_entity;

      if (entity !== 'Super_admin' && isNew) {
        req.body.changes.entity_code = entity;
      }

      if (isNew) {
        DataUtil.get_new_transaction_connection('CreatedCar', (err, connection) => {
          if (err) {
            return ResponseUtil.response(req, res, {}, err);
          }

          this.next_car_id(req, res, connection, (err2, code_id) => {
            if (err2) {
              return ResponseUtil.response(req, res, {}, err2);
            }

            req.body.changes.code_id = code_id;

            return this.base_set(req, res, { connection }, (err3, result) => {
              if (err3) {
                return DataUtil.transaction_rollback_and_release(connection, () => ResponseUtil.response(req, res, result, err3));
              }

              return DataUtil.transaction_commit_or_rollback(connection, () => ResponseUtil.response(req, res, result, null));
            });
          });
        });
      } else {
        return this.base_set(req, res, { save_change_history: true });
      }
    }
  }

  delete(req, res) {
    if (this.checkServerAcl(req, res, true, this.aclAction.DELETE)) {
      return this.base_delete(req, res, { save_change_history: true });
    }
  }

  delete_arr(req, res) {
    if (this.checkServerAcl(req, res, true, this.aclAction.DELETE)) {
      return this.base_delete_arr(req, res, { save_change_history: true });
    }
  }
}
module.exports = new Car();
