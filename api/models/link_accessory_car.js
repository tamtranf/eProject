// const uuid = require('uuid');
// const md5 = require('md5');
// const nseq = require('nseq');
// const async = require('async');
// const _ = require('lodash');
// const moment = require('moment');
const debug = require('debug')('LinkAccessoryCar');
const local_fields = require('../rules/fields_link_accessory_car');
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

class LinkAccessoryCar extends base_model {
  constructor() {
    super();

    this.id = 'link_accessory_car';
    this.table = 'link_accessory_car';
    this.form_fields = 'seq_id,car_code_id,accessory_code_id';
    this.view_fields = `${this.form_fields},maker,model,code_id,license_plate,car_year,color,passenger,category,weight,`;
    this.view_fields += 'price_per_day,status,notes,entity_code,entity_name,maker_name,year_name,color_name,category_name';
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
    // const entity = req.local.session_entity;

    // if (entity !== 'Super_admin') {
    //   options.conditions = 'entity_code=?';
    //   options.params = [entity];
    // }
    options.conditions = (options.conditions) ? options.conditions : '';
    options.params = (Array.isArray(options.params)) ? options.params : [];

    if (req.body.api_request_options) {
      options.conditions += ' accessory_code_id = ?  ';
      options.params.push(req.body.api_request_options.accessory_code_id);
    }
    return options;
  }

  check_pk(mode, changes, req, res, cb) {
    return this.base_check_pk(mode, changes, req, res, {}, cb);
  }

  datasource_load(req, res) {
    this.base_datasource_load(req, res, this.get_options_conditions(req, { force_fields: this.view_fields, table: 'v_link_accessory_car' }));
  }

  datasource_count(req, res) {
    this.base_datasource_count(req, res, this.get_options_conditions(req, { force_fields: this.view_fields, table: 'v_link_accessory_car' }));
  }

  get(req, res) {
    return this.base_get(req, res, { force_fields: this.view_fields, table: 'v_link_accessory_car' });
  }

  set(req, res) {
    if (this.checkServerAcl(req, res, true, (req.params.id === constants.IDS.ADD_NEW_RECORD_ID) ? this.aclAction.ADD : this.aclAction.EDIT)) {
      if (req.params.id === constants.IDS.ADD_NEW_RECORD_ID) {
        const sql = `SELECT count(*) as qty from ${this.table} where accessory_code_id = ? and car_code_id = ?`;
        const params = [req.body.changes.accessory_code_id, req.body.changes.car_code_id];
        DataUtil.query(sql, params, {}, (err, result) => {
          if (err) {
            return ResponseUtil.response(req, res, {}, err);
          }
          if (result[0].qty > 0) {
            return ResponseUtil.response(req, res, {}, 'Record already exists'); // ,
          }
          return this.base_set(req, res, {});
        });
      } else {
        return this.base_set(req, res, {});
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

module.exports = new LinkAccessoryCar();
