// const uuid = require('uuid');
// const md5 = require('md5');
// const nseq = require('nseq');
// const async = require('async');
// const _ = require('lodash');
const moment = require('moment');
const debug = require('debug')('Customer');
const { result } = require('lodash');
const local_fields = require('../rules/fields_customer');
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

class Customer extends base_model {
  constructor() {
    super();

    this.id = 'customer';
    this.table = 'customer';
    this.form_fields = 'seq_id,customer_id,customer_name,phone_number,postal_code,address,created_date,notes';
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
      get_customer_list: {
        method: 'post', func: 'get_customer_list', path: '/get_customer_list', no_login: false,
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
    if (this.checkServerAcl(req, res, true, this.aclAction.READ)) {
      this.base_datasource_load(req, res);
    }
  }

  datasource_count(req, res) {
    if (this.checkServerAcl(req, res, true, this.aclAction.READ)) {
      this.base_datasource_count(req, res);
    }
  }

  get(req, res) {
    if (this.checkServerAcl(req, res, true, this.aclAction.READ)) {
      return this.base_get(req, res);
    }
  }

  next_customer_id(req, res, connection, date, cb) {
    const date_code = moment(date).format('YYYYMMDD');
    const sql = `SELECT customer_id FROM customer WHERE customer_id LIKE '${date_code}%' ORDER BY customer_id DESC LIMIT 1`;

    DataUtil.query(sql, [], { connection }, (err, result) => {
      if (err) {
        return cb(err);
      }

      if (result.length === 0) {
        return cb(null, `${date_code}0001`);
      }

      const last_id = result[0].customer_id.replace(date_code, '');
      const new_id = parseInt(last_id) + 1;
      return cb(null, `${date_code}${new_id.toString().padStart(4, '0')}`);
    });
  }

  set(req, res) {
    if (
      this.checkServerAcl(req,
        res,
        true,
        req.params.id === constants.IDS.ADD_NEW_RECORD_ID ? this.aclAction.ADD : this.aclAction.EDIT)
    ) {
      if (req.params.id === constants.IDS.ADD_NEW_RECORD_ID) {
        req.body.changes.created_date = moment().format('YYYY-MM-DD');

        DataUtil.get_new_transaction_connection('CreatedCustomerID', (err, connection) => {
          if (err) {
            return ResponseUtil.response(req, res, {}, err);
          }

          this.next_customer_id(req, res, connection, req.body.changes.created_date, (err2, customer_id) => {
            if (err2) {
              return ResponseUtil.response(req, res, {}, err2);
            }

            req.body.changes.customer_id = customer_id;

            return this.base_set(req, res, { connection }, (err3, result) => {
              if (err3) {
                return DataUtil.transaction_rollback_and_release(connection, () => ResponseUtil.response(req, res, result, err3));
              }

              return DataUtil.transaction_commit_or_rollback(connection, () => ResponseUtil.response(req, res, result, null));
            });
          });
        });
      } else {
        return this.base_set(req, res, {});
      }
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

  get_customer_list(req, res) {
    DataUtil.query(`SELECT customer_id, customer_name FROM ${this.table} `, [], {}, (err, result) => {
      if (err) {
        return ResponseUtil.response(req, res, {}, err);
      }
      return ResponseUtil.response(req, res, { list: result }, err);
    });
  }
}

module.exports = new Customer();
