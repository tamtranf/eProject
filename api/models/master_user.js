const uuid = require('uuid');
const md5 = require('md5');
const nseq = require('nseq');
const async = require('async');
const _ = require('lodash');
const moment = require('moment');
const debug = require('debug')('MasterUser');
const local_fields = require('../rules/fields_master_user');
const base_model = require('../libs/base_model');
// const login = require('./login');
const constants = require('../rules/constants');
const DataUtil = require('../libs/data_utils');
const ResponseUtil = require('../libs/response_utils');
// const PrintUtil = require('../libs/print_util');
// const system_setting = require('./system_setting');
// const { lt } = require('lodash');

var approval_history = {}

class MasterUser extends base_model {
  constructor() {
    super();
    this.PASS_HISTORY_SALT="5691CC36-7284-44C1-BF44-BF40D3A75DCE" // DO NOT CHANGE THIS VALUE.
    // this.table_id = constants.TABLE_ID.USER;
    this.table = 'master_user';
    debug('Started');
    this.routes = [];
    this.form_fields = 'seq_id,user_id';
    this.tab_fields = 'seq_id,user_id';
    this.pk = "user_id";
    // this.model_acl = this.acl.master_user;
    // this.set_routes();
  }
  get_fields() {
    return local_fields;
  }
  local_add_user(data, cb) {
    data.salt = uuid.v4();
    data.password = data['password'] //login.encrypt_pass(data.salt, data['password']);
    DataUtil.query('INSERT INTO ' + this.table + ' SET ?', data, {}, (err, result) => {
      if (err) {
        debug('login.add.err: ', err);
      }
      return cb(err,result);
    });
  }

}

module.exports = new MasterUser();
