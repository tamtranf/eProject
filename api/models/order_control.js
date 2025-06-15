// const uuid = require('uuid');
// const md5 = require('md5');
// const nseq = require('nseq');
// const async = require('async');
// const _ = require('lodash');
const moment = require('moment');
const debug = require('debug')('OrderControl');
const local_fields = require('../rules/fields_order_control');
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

class OrderControl extends base_model {
  constructor() {
    super();

    this.id = 'order_control';
    this.table = 'order_control';
    this.form_fields = 'seq_id,order_id,customer_id,car_code_id,start_date,end_date,status,total_value,notes,entity_code,incharge_user_name';
    this.view_fields = `${this.form_fields},maker,model,license_plate,car_year,color,passenger,category,weight,car_price,car_status,car_notes`;
    this.view_fields += ',maker_name,year_name,color_name,category_name,customer_name,phone_number,postal_code,address,created_date,customer_notes,full_name';
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
    this.base_datasource_load(req, res, this.get_options_conditions(req, { force_fields: this.view_fields, table: 'v_order' }));
  }

  datasource_count(req, res) {
    this.base_datasource_count(req, res, this.get_options_conditions(req, { force_fields: this.view_fields, table: 'v_order' }));
  }

  get(req, res) {
    return this.base_get(req, res, { force_fields: this.view_fields, table: 'v_order' });
  }

  next_order_id(req, res, connection, cb) {
    const date_code = moment(new Date()).format('YYYYMMDD');
    const sql = `
    SELECT order_id 
    FROM order_control 
    WHERE order_id LIKE 'ORD${date_code}%' 
    ORDER BY order_id DESC 
    LIMIT 1
  `;

    DataUtil.query(sql, [], { connection }, (err, result) => {
      if (err) return cb(err);

      if (result.length === 0) {
        return cb(null, `ORD${date_code}0001`);
      }

      const last_id = result[0].order_id.replace(`ORD${date_code}`, '');
      const new_id = parseInt(last_id) + 1;
      const formatted_id = `ORD${date_code}${new_id.toString().padStart(4, '0')}`;
      return cb(null, formatted_id);
    });
  }

  set(req, res) {
    if (
      this.checkServerAcl(req,
        res,
        true,
        (req.params.id === constants.IDS.ADD_NEW_RECORD_ID) ? this.aclAction.ADD : this.aclAction.EDIT)
    ) {
      const entity = req.local.session_entity;

      // Gán entity_code nếu là tạo mới và không phải SUPER_ADMIN
      if (
        entity !== 'Super_admin' && req.params.id === constants.IDS.ADD_NEW_RECORD_ID
      ) {
        req.body.changes.entity_code = entity;
      }

      // Nếu total_value là chuỗi rỗng, set về 0
      if (req.body.changes.total_value === '') {
        req.body.changes.total_value = 0;
      }

      // Nếu là tạo bản ghi mới
      if (req.params.id === constants.IDS.ADD_NEW_RECORD_ID) {
        DataUtil.get_new_transaction_connection('CreatedOrder', (err, connection) => {
          if (err) {
            return ResponseUtil.response(req, res, {}, err);
          }

          this.next_order_id(req, res, connection, (err2, order_id) => {
            if (err2) {
              return ResponseUtil.response(req, res, {}, err2);
            }

            req.body.changes.order_id = order_id;

            return this.base_set(req, res, { connection }, (err3, result) => {
              if (err3) {
                return DataUtil.transaction_rollback_and_release(connection, () => {
                  ResponseUtil.response(req, res, result, err3);
                });
              }

              return DataUtil.transaction_commit_or_rollback(connection, () => {
                ResponseUtil.response(req, res, result, null);
              });
            });
          });
        });
      } else {
      // Nếu là cập nhật
        return this.base_set(req, res, { save_change_history: true });
      }
    }
  }

  delete(req, res) {
    return this.base_delete(req, res);
  }

  delete_arr(req, res) {
    return this.base_delete_arr(req, res);
  }
}

module.exports = new OrderControl();
