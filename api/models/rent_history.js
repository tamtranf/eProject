// const uuid = require('uuid');
// const md5 = require('md5');
// const nseq = require('nseq');
// const async = require('async');
// const _ = require('lodash');
// const moment = require('moment');
const debug = require('debug')('Car');
<<<<<<< HEAD
const local_fields = require('../rules/fields_car');
=======
const local_fields = require('../rules/fields_rent_history');
>>>>>>> e8bf277 (renthistory)
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

<<<<<<< HEAD
class Car extends base_model {
=======
class RentHistory extends base_model {
>>>>>>> e8bf277 (renthistory)
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
<<<<<<< HEAD
    if (this.checkSeverAcl(req, res, true, this.aclAction.READ)) {
=======
    if (this.checkServerAcl(req, res, true, this.aclAction.READ)) {
>>>>>>> e8bf277 (renthistory)
      this.base_datasource_load(req, res, this.get_options_conditions(req));
    }
  }

  datasource_count(req, res) {
<<<<<<< HEAD
    if (this.checkSeverAcl(req, res, true, this.aclAction.READ)) {
=======
    if (this.checkServerAcl(req, res, true, this.aclAction.READ)) {
>>>>>>> e8bf277 (renthistory)
      this.base_datasource_count(req, res, this.get_options_conditions(req));
    }
  }

  get(req, res) {
<<<<<<< HEAD
    if (this.checkSeverAcl(req, res, true, this.aclAction.READ)) {
=======
    if (this.checkServerAcl(req, res, true, this.aclAction.READ)) {
>>>>>>> e8bf277 (renthistory)
      return this.base_get(req, res);
    }
  }

<<<<<<< HEAD
  //    Change the “set”, to copy the entity_code from the “car” table.
  //    DataUtil.query('Select entity_code from car where seq_id = ?', [req.body.changes.car_id], {}, (err, result) => {
  //    if (err) {
  //     return ResponseUtil.error(res, { message:err.message });
  //   }
  //   if (result.length === 0) {
  //     return ResponseUtil.error(res, { message: 'Car not found' });
  // }
  //     req.body.changes.entity_code = result[0].entity_code;
  //   return this.base_set(req, res, {});
  // });
  set(req, res) {
    if (this.checkSeverAcl(req, res, true, (req.params.id === constants.IDS.ADD_NEW_RECORD_ID) ? this.aclAction.ADD : this.aclAction.EDIT)) {
      const entity = req.local.session_entity;
      if (entity !== 'Super_admin' && req.params.id === constants.IDS.ADD_NEW_RECORD_ID) {
        req.body.changes.entity_code = entity;
      }

      return this.base_set(req, res, {});
=======
  set(req, res) {
    if (this.checkServerAcl(req, res, true, (req.params.id === constants.IDS.ADD_NEW_RECORD_ID) ? this.aclAction.ADD : this.aclAction.EDIT)) {
    //   const entity = req.local.session_entity;
    //   if (entity !== 'Super_admin' && req.params.id === constants.IDS.ADD_NEW_RECORD_ID) {
    //     req.body.changes.entity_code = entity;
    //   }

      DataUtil.query('Select entity_code from car where seq_id = ?', [req.body.changes.car_id], {}, (err, result) => {
        if (err) {
          return ResponseUtil.error(res, { message: err.message });
        }
        if (result.length === 0) {
          return ResponseUtil.error(res, { message: 'Car not found' });
        }
        req.body.changes.entity_code = result[0].entity_code;
        return this.base_set(req, res, {});
      });
>>>>>>> e8bf277 (renthistory)
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
<<<<<<< HEAD
module.exports = new Car();
=======
module.exports = new RentHistory();
>>>>>>> e8bf277 (renthistory)
