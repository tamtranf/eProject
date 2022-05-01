const _ = require('lodash');
const async = require('async');
const uuid = require('uuid');
const moment = require('moment');
const XLSX = require('xlsx');
const Nseq = require('nseq');
const LRU = require('lru-cache');
const DataUtil = require('./data_utils');
const ResponseUtil = require('./response_utils');
const constants = require('../rules/constants');
const config = require('../config/default');

moment.suppressDeprecationWarnings = true;

const cache = new LRU({
  max: 500,
  maxAge: 1000 * 10,
});

let field_sizes_all = require('../db_info/version_info.json');

const field_sizes = {};
for (const t in field_sizes_all.tables) {
  field_sizes[t] = {};
  for (const fk in field_sizes_all.tables[t]) {
    const f = field_sizes_all.tables[t][fk];
    const obj_type = {};
    const type = f.Type;
    if (type.indexOf('varchar') === 0) {
      const s = type.split('(');
      obj_type.type = 'varchar';
      obj_type.size = parseInt(s[1].replace(')', ''));
    } else {
      obj_type.type = type;
    }
    // if(types.indexOf(obj_type.type) < 0){
    //   types.push(obj_type.type)
    // }
    field_sizes[t][fk] = obj_type;
  }
}
field_sizes_all = null;

class BaseModel {
  constructor() {
    // FIXME: All methods should support connection.
    // this.acl = acl_rules;
    // this.aclAction = constants.ACL_ACTION;

    this.allow_save_change_history = config.tables.indexOf('change_history') > -1;
    setTimeout(() => {
      // validate fields
      const fields_arr = this.tab_fields || this.form_fields;
      if (fields_arr && fields_arr.length > 0 && Array.isArray(this.get_fields()) && this.get_fields().length > 0) {
        fields_arr.split(',').forEach((field) => {
          const ignore_system_fields = ['seq_id'];

          if (ignore_system_fields.indexOf(field) < 0 && this.table.indexOf('v_') !== 0) {
            if (typeof this.get_fields !== 'function') {
              console.error(`The function get_fields was not found at ${this.table}`);
            } else if (Array.isArray(this.get_fields()) === false || this.get_fields().length < 1) {
              console.error(`The function get_fields has no fields at ${this.table}`);
            } else if (typeof this.get_fields().fields[field] === 'undefined') {
              console.log('\n\n\n========================================');
              console.log({ fields_arr });
              console.error(`Field ${field} not found at ${this.table}`);
              console.log('========================================\n\n\n');
            }
          }
        });
      }
    }, 3000);
  }

  ifNull(val, def = '') {
    if (typeof val === 'undefined' || (val === null) || (val === false) || val === '') {
      return def;
    }
    return val;
  }

  isDate(date) {
    // eslint-disable-next-line no-restricted-globals
    return (new Date(date) !== 'Invalid Date') && !isNaN(new Date(date));
  }

  checkServerUserPermission(req, res, model_acl, permission, _requester = '', _custom_error_message = false) {
    // FIXME: To be implemented
    // if (model_acl === null || model_acl === true) {
    //   model_acl = this.model_acl;
    // }
    // var user_role = req.user_token_session.user_role || 'none';
    // if (Array.isArray(model_acl.full) && model_acl.full.indexOf(user_role) > -1) {
    //   return true;
    // }
    // if (Array.isArray(model_acl[permission]) && model_acl[permission].indexOf(user_role) > -1) {
    //   return true;
    // }
    // console.log('checkServerUserPermission Access not allowed', { model_acl, permission, requester });
    // ResponseUtil.response(req, res, null, custom_error_message || 'アクセスが許可されていません。');
    return true;
  }

  form_fields_formatted(options) {
    let temp = _.clone(this.form_fields);
    if (options && typeof options.force_fields !== 'undefined') {
      temp = _.clone(options.force_fields);
    }
    if (options && typeof options.extend_fields === 'string') {
      temp = `${temp},${options.extend_fields}`;
    }
    const m = temp.split(',').map((o) => `\`${o}\``);
    return m.join(',');
  }

  base_datasource_position(req, res, options = {}) {
    const pos_start = 0;
    const load_length = 1000000;
    let params = [];
    let conditions = '';
    if (typeof options.conditions !== 'undefined' && typeof options.params !== 'undefined') {
      params = options.params;
      conditions = options.conditions;
    }
    const filter_condition = this.base_datasource_filter_parser(req, conditions, params);
    if (filter_condition.error) {
      return ResponseUtil.response(req, res, null, filter_condition.error);
    }
    const orderby = this.base_datasource_sort_parser(req);
    const table = options.table || this.table;
    const sql = `SELECT seq_id FROM ${table} ${filter_condition.condition} ORDER BY ${orderby} LIMIT ${pos_start},${load_length}`;
    DataUtil.query(sql, filter_condition.params, {}, (err, data) => {
      const find_seq_id = req.params.id;
      let position = _.findIndex(data, (i) => i.seq_id === find_seq_id);
      const l = data.length;
      for (let i = 0; i < l; i += 1) {
        if (data[i].seq_id === find_seq_id) {
          position = i;
        }
      }
      return ResponseUtil.response(req, res, { data: position }, err);
    });
  }

  base_datasource_load_for_export(req, res, options = {}, cb = false) {
    req.params.start = parseInt(req.params.start || 0);
    req.params.end = parseInt(req.params.end || 1000000);
    this.base_datasource_load(req, res, options, cb);
  }

  base_datasource_load(req, res, options = {}, cb = false) {
    const pos_start = parseInt(req.params.start || 0);
    const pos_end = parseInt(req.params.end || 0);
    let load_length = pos_end - pos_start;
    if (load_length < 1) {
      load_length = 1;
    } else if (load_length > 1000000) {
      load_length = 1000000;
    }
    load_length += 10;
    let params = [];
    let conditions = '';
    if (typeof options.conditions !== 'undefined' && typeof options.params !== 'undefined') {
      params = options.params;
      conditions = options.conditions;
    }
    const filter_condition = this.base_datasource_filter_parser(req, conditions, params);
    if (filter_condition.error) {
      return ResponseUtil.response(req, res, null, filter_condition.error);
    }
    const orderby = this.base_datasource_sort_parser(req);
    const table = options.table || this.table;
    let sql = `SELECT ${this.form_fields_formatted(options)} FROM ${table} ${filter_condition.condition} `;
    sql += `ORDER BY ${orderby} LIMIT ${pos_start},${load_length}`;
    // console.log('base_datasource_load',JSON.stringify({table, params:req.params,body:req.body, sql, sql_params:filter_condition.params},null,4));
    const query_options = {};
    if (options.show_query === true) {
      query_options.show_query = true;
    }
    let cache_key = false;
    if (options.cache_ttl > 0) {
      cache_key = JSON.stringify({ sql, params: filter_condition.params });
      const cached = cache.get(cache_key);
      if (typeof cached !== 'undefined') {
        return ResponseUtil.response(req, res, cached, null, {}, cb);
      }
    }

    DataUtil.query(sql, filter_condition.params, options, (err, data) => {
      if (cache_key && !err && options.cache_ttl > 0) {
        cache.set(cache_key, data, options.cache_ttl);
      }
      ResponseUtil.response(req, res, data, err, {}, cb);
    });
  }

  base_datasource_count(req, res, options = {}, cb = false) {
    let params = [];
    let conditions = '';
    if (typeof options.conditions !== 'undefined' && typeof options.params !== 'undefined') {
      params = options.params;
      conditions = options.conditions;
    }
    const filter_condition = this.base_datasource_filter_parser(req, conditions, params);
    if (filter_condition.error) {
      return ResponseUtil.response(req, res, null, filter_condition.error, {}, cb);
    }
    const table = options.table || this.table;

    const sql = `SELECT count(*) as qty FROM ${table} ${filter_condition.condition}`;
    let cache_key = false;
    if (options.cache_ttl > 0) {
      cache_key = JSON.stringify({ sql, params: filter_condition.params });
      const cached = cache.get(cache_key);
      if (typeof cached !== 'undefined') {
        return ResponseUtil.response(req, res, cached, null, {}, cb);
      }
    }

    DataUtil.query(sql, filter_condition.params, options, (err, data) => {
      if (cache_key && !err && options.cache_ttl > 0) {
        cache.set(cache_key, data, options.cache_ttl);
      }
      ResponseUtil.response(req, res, data, err, {}, cb);
    });
  }

  base_get(req, res, options = {}, cb = false) {
    let local_connection = false;
    if (options && options.connection) {
      local_connection = options.connection;
    }
    let seq_id = req.params.id;
    if (Number.isNaN(options.force_seq_id) === false && options.force_seq_id > -1) {
      seq_id = options.force_seq_id;
    }
    if (Number.isNaN(seq_id) === true) {
      return ResponseUtil.response(req, res, null, `invalid seq_id: ${seq_id}`, {}, cb);
    }

    let conditions = ' seq_id = ? ';
    const params = [seq_id];
    if (typeof options.conditions !== 'undefined' && typeof options.params !== 'undefined') {
      if (Array.isArray(options.params) && options.params.length > 0) {
        options.params.forEach((o) => {
          params.push(o);
        });
      }
      if (options.conditions && options.conditions.length > 0) {
        if (conditions && conditions.length > 0) {
          conditions += ' AND ';
        }
        conditions += options.conditions;
      }
    }
    const table = options.table || this.table;
    let load_fields = this.form_fields_formatted(options);
    if (options.load_all_fields === true) {
      load_fields = '*';
    }
    const sql = `SELECT ${load_fields} FROM ${table} WHERE ${conditions} LIMIT 0,1`;
    DataUtil.query(sql, params, { connection: local_connection, show_query: true }, (err, data) => {
      if (data && data.length === 1) {
        ResponseUtil.response(req, res, { data: data[0] }, err, {}, cb);
      } else {
        ResponseUtil.response(req, res, null, 'Data not found at base_get.', {}, cb);
      }
    });
  }

  base_get_all(req, res, options = false, cb = false) {
    let local_connection = false;
    if (options && options.connection) {
      local_connection = options.connection;
    }
    const seq_id = req.params.id;
    if (Number.isNaN(seq_id) === true) {
      return ResponseUtil.response(req, res, null, `invalid seq_id: ${seq_id}`, {}, cb);
    }
    let local_table = this.table;
    if (options && options.force_get_table) {
      local_table = options.force_get_table;
    }
    const sql = `SELECT * FROM ${local_table} WHERE seq_id = ? LIMIT 0,1`;
    DataUtil.query(sql, [seq_id], { connection: local_connection }, (err, data) => {
      if (data && data.length === 1) {
        ResponseUtil.response(req, res, { data: data[0] }, err, {}, cb);
      } else {
        ResponseUtil.response(req, res, null, 'Data not found at base _get_all.', {}, cb);
      }
    });
  }

  validate_field_data_type(req, table, field, val) {
    if (typeof val === 'undefined' || (val === null) || (val === false) || val === '') {
      return false;
    }
    if (field === 'last_changed_uuid') {
      return false;
    }

    const field_info = field_sizes[table][field];
    if (typeof field_info === 'undefined') {
      req.log.warn({ table, field, val }, 'Field not found');
      console.trace('Field not found', { table, field, val });
      return false; // Allow the request now
    }
    switch (field_info.type) {
    case 'varchar':
    case 'text':
      const data_len = _.size(val);
      if (data_len > field_info.size) {
        const { label } = this.get_fields().fields[field];
        return {
          field, field_info, data_len, err: `${label}は文字数オーバーです。 最大値は${field_info.size}です。現状値は${data_len}です。`,
        };
      }
      break;
    case 'date':
    case 'datetime':
    case 'timestamp':
      if (parseInt(new Date(val).getTime()) !== new Date(val).getTime()) {
        return { field, field_info, err: 'Invalid format for date' };
      }
      break;
    case 'int':
    case 'int unsigned':
    case 'tinyint':
    case 'smallint':
      if (Number.isNaN(val) === true) {
        return { field, field_info, err: 'Invalid value, it should be a number' };
      }
      break;
    default:
      console.trace('Unexpected field type', { field_info });
      req.log.warn({
        table, field, val, field_info,
      }, 'Unexpected field type');
      break;
    }
    return false;
  }

  base_set(req, res, options, cb = false) {
    let local_connection = false;
    if (options && options.connection) {
      local_connection = options.connection;
    }
    const temp = req.body.changes;
    const changes = {};
    const s_fields = this.form_fields.split(',');
    s_fields.forEach((f) => {
      if (typeof temp[f] !== 'undefined') {
        changes[f] = temp[f];
      }
    });
    if (Array.isArray(s_fields) && s_fields.length > 0 && s_fields.indexOf('last_update_date') > -1) {
      changes.last_update_date = new Date();
    }
    let seq_id = req.params.id;
    if (Number.isNaN(seq_id) === true) {
      return ResponseUtil.response(req, res, null, `invalid seq_id: ${seq_id}`, {}, cb);
    }
    if (seq_id === constants.IDS.ADD_NEW_RECORD_ID) {
      if (Array.isArray(s_fields) && s_fields.length > 0 && s_fields.indexOf('registration_date') > -1) {
        changes.registration_date = new Date();
      }
      new Nseq().do([
        (self) => {
          let method = 'INSERT';
          if (options.use_replace === true) {
            method = 'REPLACE';
          }

          Object.keys(changes).forEach((f) => {
            const field_info = this.get_fields().fields[f];
            if (changes[f] === '' && field_info.type === constants.TYPES.DATE_PICKER) {
              changes[f] = null;
            }
          });

          const sql = `${method} INTO ${this.table} SET ?`;
          DataUtil.query(sql, changes, { connection: local_connection }, (err, result) => {
            req.log.info({
              sql, changes, err, result, transaction: local_connection !== false,
            }, 'base_set insert');
            if (err) {
              return ResponseUtil.response(req, res, result, err, {}, cb);
            } if (result && result.insertId && result.insertId > -1) {
              req.params.id = result.insertId;
              seq_id = result.insertId;
              self.next();
            } else {
              return ResponseUtil.response(req, res, result, '新しいデータの保存に失敗しました。', {}, cb);
            }
          });
        },
        (self) => {
          if (options.save_change_history === true) {
            const ops = {
              changes,
              seq_id,
              history_mode: constants.HISTORY_MODE.NEW,
              requester: `base_model/base_set/${this.table}`,
              ref_table: options.ref_table || this.table,
            };
            if (options && options.connection) {
              ops.connection = options.connection;
            }
            this.base_save_change_history(req, res, ops, (err) => {
              if (err) {
                console.log('ERROR TO SAVE base_ set_log_history', err);
                return ResponseUtil.response(req, res, null, err, {}, cb);
              }
              self.next();
            });
          } else {
            self.next();
          }
        },
        (_self) => {
          if (cb === false) {
            const ops = { base_set_request: true };
            return this.get(req, res, ops);
          }
          const ops = { base_set_request: true };
          if (options && options.connection) {
            ops.connection = options.connection;
          }
          if (options && options.force_get_table) {
            ops.force_get_table = options.force_get_table;
          }
          return this.base_get_all(req, res, ops, cb);
        },
      ]);
    } else {
      new Nseq().do([

        (self) => {
          if (options.save_change_history === true) {
            const ops = {
              changes,
              seq_id,
              history_mode: constants.HISTORY_MODE.UPDATE,
              requester: `base_model/base_set/${this.table}`,
              ref_table: options.ref_table || this.table,
            };
            if (options && options.connection) {
              ops.connection = options.connection;
            }
            this.base_save_change_history(req, res, ops, (err) => {
              if (err) {
                console.log('ERROR TO SAVE base_ set_log_history', err);
                return ResponseUtil.response(req, res, null, err, {}, cb);
              }
              self.next();
            });
          } else {
            self.next();
          }
        },

        (_self) => {
          const { upd_query, upd_data } = this.parse_upd_changed(changes, seq_id);
          DataUtil.query(upd_query, upd_data, { connection: local_connection }, (err, data) => {
            // req.log.info({
            //   upd_query, upd_data, err, result: data, transaction: local_connection !== false,
            // }, 'base_set update');
            if (err) {
              return ResponseUtil.response(req, res, data, err, {}, cb);
            } if (data.affectedRows < 1 && changes.last_changed_uuid) {
              return ResponseUtil.response(req, res, data, 'Data was not updated.', {}, cb);
            }
            const ops = {};
            if (options && options.connection) {
              ops.connection = options.connection;
            }
            if (options && options.force_get_table) {
              ops.force_get_table = options.force_get_table;
            }
            if (cb === false) {
              return this.get(req, res, ops);
            }
            return this.base_get_all(req, res, ops, cb);
          });
        },
      ]);
    }
  }

  base_save_change_history(req, res, options, cb) {
    // It should be here and not in the log_history model to avoid cross reference.
    if (typeof this.table === 'undefined' && typeof options.table === 'undefined') {
      return cb(`No table (${options.requester})`);
    }
    if (this.allow_save_change_history === false) {
      return cb('Can not save log, the table change_history do not exist');
    }
    const do_not_log_fields = ['last_changed_fields', 'approval_status_flag'];
    const now = new Date();
    const is_new = options.history_mode === constants.HISTORY_MODE.NEW; // TODO: In case of new, need first to insert the record, to get the seq_id
    const { changes, seq_id } = options;
    const ref_table = options.ref_table || this.ref_table;
    const user_name = req.local.session_user;
    // const user_seq_id = req.user_token_session.user_seq_id || 0;
    // let description = '';
    const get_options = {
      load_all_fields: true,
      force_seq_id: seq_id,
      table: options.table || this.table,
    };
    let local_connection = false;
    if (options && options.connection) {
      get_options.connection = options.connection;
      local_connection = options.connection;
    }
    // let data_id = '-';
    let old_data = {};
    let new_data = {};
    new Nseq().do([

      (self) => {
        if (is_new) {
          this.base_get(req, res, get_options, (err, _new_data) => {
            if (typeof _new_data === 'undefined' || typeof _new_data.data === 'undefined') {
              _new_data = { data: {} };
            }
            new_data = _new_data.data;
            do_not_log_fields.forEach((f) => {
              delete new_data[f];
            });
            self.next();
          });
        } else {
          this.base_get(req, res, get_options, (err, _old_data) => {
            if (typeof _old_data === 'undefined' || typeof _old_data.data === 'undefined') {
              _old_data = { data: {} };
            }
            old_data = _old_data.data;
            const change_keys = Object.keys(changes);

            async.mapLimit(change_keys, 1, (key, done) => {
              let old_val = old_data[key];
              if (typeof old_data[key] === 'undefined') {
                old_val = '?';
              }
              let new_val = changes[key];
              if (old_val === null || old_val === false) {
                old_val = '';
              }
              if (new_val === null || new_val === false) {
                new_val = '';
              }
              if (/^\d+$/.test(new_val) === true && /^\d+$/.test(old_val) === true) {
                old_val = parseInt(old_val);
                new_val = parseInt(new_val);
              } else {
                if (this.isDate(new_val) === true) {
                  new_val = moment(new_val).format('YYYY/MM/DD HH:mm:ss');
                }
                if (this.isDate(old_val) === true) {
                  old_val = moment(old_val).format('YYYY/MM/DD HH:mm:ss');
                }
              }
              if (old_val === new_val) {
                // D0 nothing
              } else if (do_not_log_fields.indexOf(key) > -1) {
                // D0 nothing
              } else {
                new_data[key] = new_val;
              }
              done();
            }, (err2, _allDone) => {
              if (err2) {
                return cb(err2 || err);
              }
              self.next();
            });
          });
        }
      },
      (_self) => {
        const log_changes = {
          change_time: now,
          user_name,
          // user_seq_id: user_seq_id || 0,
          ref_table,
          ref_id: seq_id,
          mode: options.history_mode || 0,
          // description,
          old_data: JSON.stringify(old_data),
          new_data: JSON.stringify(new_data),
        };
        if (options.history_mode === constants.HISTORY_MODE.UPDATE && Object.keys(new_data).length === 0) {
          // Dont need to save the log.
          return cb();
        }
        DataUtil.query('INSERT INTO change_history SET ?', log_changes, { connection: local_connection }, (err, _result) => {
          cb(err);
        });
      },
    ]);
  }

  base_check_pk(mode, changes, req, res, options, cb) {
    if (mode === 'update' && typeof changes[this.pk] === 'undefined') {
      return cb(null);
    }
    if (this.allow_empty_pk) {
      if (typeof changes[this.pk] === 'undefined' || changes[this.pk] === null || changes[this.pk] === false || changes[this.pk].trim() === '') {
        changes[this.pk] = '';
        return cb(null);
      }
    }
    let sql = `SELECT count(*) as qty FROM ${this.table} WHERE ${this.pk} = ? `;
    const params = [changes[this.pk]];
    if (mode === 'update') {
      sql += ' AND seq_id !== ?';
      params.push(req.params.id);
    }
    DataUtil.query(sql, params, {}, (err, data) => {
      if (!data || data.length === 0) {
        err = `Failed to load PK data.${sql} / [${params.join(',')}]`;
      }
      if (err) {
        console.log('Error while check the PK', err);
        return cb(err);
      }
      if (data[0].qty !== 0) {
        if (this.table && this.table.indexOf('master_dev') > -1) {
          return cb(`ユーザID = ${changes[this.pk]} はすでに登録されています。`);
        }
        return cb(`PK ${this.pk}=${changes[this.pk]} はすでに登録されています。`);
      }
      return cb(null);
    });
  }

  base_delete(req, res, options = {}, cb = false) {
    const { seq_id } = req.body;
    const { seq_id_match3 } = req.body;
    if (seq_id * 3 !== seq_id_match3) {
      return ResponseUtil.response(req, res, {}, 'Invalid seq_id_match3 value', {}, cb);
    }
    new Nseq().do([
      (self) => {
        self.next();
      },
      (self) => {
        if (options.save_change_history === true) {
          const ops = {
            changes: {},
            seq_id,
            history_mode: constants.HISTORY_MODE.DELETE,
            requester: `base_model/base_delete/${this.table}`,
            ref_table: options.ref_table || this.table,
          };
          if (options && options.connection) {
            ops.connection = options.connection;
          }
          this.base_save_change_history(req, res, ops, (err) => {
            if (err) {
              console.log('ERROR TO SAVE base_ set_log_history', err);
              return ResponseUtil.response(req, res, null, err, {}, cb);
            }
            self.next();
          });
        } else {
          self.next();
        }
      },
      (_self) => {
        req.log.info({ seq_id, table: this.table }, 'Delete a record');
        DataUtil.query(`DELETE FROM ${this.table} WHERE seq_id = ?;`, seq_id, options, (err, result) => ResponseUtil.response(req, res, result, err, {}, cb));
      },
    ]);
  }

  base_delete_arr(req, res, options = {}) {
    const arr = req.body.array;
    if (Array.isArray(arr) === false || arr.length === 0 || req.body.array_match3 !== arr.length * 3) {
      return ResponseUtil.response(req, res, [], 'arrayまたはarray_match3のバリデーターが失敗しました。');
    }
    let connection = false;
    const opt = {};
    (new Nseq()).do([
      (self) => {
        DataUtil.get_connection('base_model/delete_arr', (err, _connection) => {
          if (err) {
            return ResponseUtil.response(req, res, [], '接続に失敗しました。');
          }
          connection = _connection;
          self.next();
        });
      },
      (self) => {
        DataUtil.begin_transaction(connection, (err) => {
          if (err) {
            return ResponseUtil.response(req, res, [], 'トランザクションの開始に失敗しました。');
          }
          opt.connection = connection;
          self.next();
        });
      },
      (_self) => {
        async.mapLimit(arr, 1, (item, done) => {
          req.body.seq_id = item;
          req.body.seq_id_match3 = item * 3;
          opt.save_change_history = options.save_change_history || false;
          req.log.info(`Deleting the record id ${item} from ${this.table}`);
          this.base_delete(req, res, opt, (err) => {
            done(err);
          });
        }, (err, _allDone) => {
          if (err) {
            DataUtil.transaction_rollback_and_release(connection, (err2) => ResponseUtil.response(req, res, [], err2 || err));
          } else {
            DataUtil.transaction_commit_or_rollback(connection, (err3) => ResponseUtil.response(req, res, [], err3));
          }
        });
      },
    ]);
  }

  parse_upd_changed(changes, seq_id = false) {
    const data_type = this.get_fields().fields;
    let upd_query = `UPDATE ${this.table} SET `;
    const upd_data = [];
    let comma = '';
    for (const key in changes) {
      if (key === 'last_changed_uuid' || key === 'bulk_last_changed_uuid') {
        // Will set a new last_changed_uuid.
        upd_query += `${comma}\`last_changed_uuid\`=?`;
        upd_data.push(moment(new Date()).format('YYYYMMDD_HHmmss_') + uuid.v4());
      } else if (changes[key] === null) {
        upd_query += `${comma}\`${key}\`=NULL`;
      } else {
        upd_query += `${comma}\`${key}\`=?`;
        if (typeof data_type[key] !== 'undefined' && data_type[key].type.indexOf('date') > -1) {
          const date_obj = new Date(changes[key]);
          upd_data.push(date_obj);
        } else {
          upd_data.push(changes[key]);
        }
      }
      comma = ', ';
    }
    if (seq_id && Number.isNaN(seq_id) === false && seq_id > -1) {
      upd_query += ' WHERE seq_id = ?';
      upd_data.push(seq_id);
      if (typeof changes.last_changed_uuid !== 'undefined' && (`${changes.last_changed_uuid}`).length > 30) {
        if (this.form_fields && this.form_fields.indexOf('last_changed_uuid') > -1) {
          upd_query += ' AND last_changed_uuid = ?';
          upd_data.push(changes.last_changed_uuid);
        }
      }
    } else {
      upd_query += ' WHERE seq_id = -1';
    }
    return { upd_query, upd_data };
  }

  base_save_from_import(save_data, options, cb) {
    DataUtil.query(`INSERT INTO ${this.table} SET ?`, save_data, options, (err, data) => cb(err, data));
  }

  base_datasource_sort_parser(req, def = 'seq_id') {
    const sort = req.body.sort || false;
    let orderby = def || 'seq_id';
    if (sort) {
      let temp_order_by = '';
      sort.forEach((s) => {
        if (['button_options', 'more_details'].indexOf(s.colId) < 0) {
          if (s.colId === 'id') {
            s.colId = 'seq_id';
          }
          const d = s.sort === 'desc' ? 'DESC' : 'ASC';
          if (temp_order_by.length > 0) {
            temp_order_by += ', ';
          }
          temp_order_by += ` ${s.colId} ${d}`;
        }
      });
      if (temp_order_by.length > 0) {
        orderby = temp_order_by;
      }
    }
    return orderby;
  }

  base_datasource_filter_parser(req, condition, params) {
    const filter = req.body.filter || false;
    let fcondition = '';
    let r_block1 = '';
    let r_block2 = '';
    let r_block3 = '';
    let r_block1_field = ''; // search_with_between step5.1
    let r_block2_field = '';
    let r_block3_field = '';
    let r_block1_val = '';
    let r_block2_val = '';
    let r_block3_val = '';

    [1, 2, 3].forEach((f) => {
      let temp_condition = '';
      if (filter && filter[f] && filter[f].value && filter[f].value.length > 0 && filter[f].field && filter[f].field.indexOf('emulate_search') !== 0) {
        if (this.get_fields().fields[filter[f].field] && this.get_fields().fields[filter[f].field].exact_value === true) {
          filter[f].exact_value = true;
        }
        let val = filter[f].value;
        if (filter[f].starting_with === true) {
          temp_condition += `${filter[f].field} LIKE ?`;
          val = `${val}%`;
        } else if (filter[f].exact_value === true) {
          temp_condition += `${filter[f].field} = ?`;
        } else if (val === 'SELECTED_EMPTY_SELECT_BOX') {
          temp_condition += ` (${filter[f].field} = ? OR ${filter[f].field} IS NULL ) `;
          val = '';
        } else if (val === 'NOT_EMPTY_VALUE') {
          temp_condition += ` (${filter[f].field} <> ? AND ${filter[f].field} IS NOT NULL ) `;
          val = '';
        } else if (filter[f].t.indexOf('select') === 0 && filter[f].t.indexOf('select3') < 0) {
          temp_condition += `${filter[f].field} = ?`;
        } else if (filter[f].t.indexOf('current_time') === 0 || filter[f].t.indexOf('date_picker') === 0) {
          if (val.length > 10) {
            temp_condition += `${filter[f].field} = ?`; // Search for date and time
          } else {
            temp_condition += ` DATE(${filter[f].field}) = ?`; // Search only for date
          }
        } else if (this.get_fields().fields[filter[f].field] && this.get_fields().fields[filter[f].field].field_type === 'number') {
          temp_condition += `${filter[f].field} = ?`;
          // val = '' + val + '';
        } else {
          temp_condition += `${filter[f].field} LIKE ?`;
          val = `%${val}%`;
        }
        if (f === 1) {
          r_block1_val = val; // search_with_between step5.2
          r_block1_field = filter[f].field;
          r_block1 = temp_condition;
        } else if (f === 2) {
          r_block2_val = val;
          r_block2_field = filter[f].field;
          r_block2 = temp_condition;
        } else if (f === 3) {
          r_block3_val = val;
          r_block3_field = filter[f].field;
          r_block3 = temp_condition;
        }
      }
    });
    if (r_block1.length === 0) {
      // do nothing
    } else if (r_block2.length === 0) {
      // only 1
      fcondition += ` ( ${r_block1} ) `;
      params.push(r_block1_val);
    } else if (filter.j1 === 'BETWEEN' && r_block1_field === r_block2_field && r_block3.length === 0) {
      // search_with_between step6
      // only 2 but is BETWEEN
      fcondition += ` ( ${r_block1_field} BETWEEN ? AND ?  ) `;
      params.push(r_block1_val);
      params.push(r_block2_val);
    } else if (r_block3.length === 0) {
      // only 2
      fcondition += ` ( ( ${r_block1} ) ${filter.j1} ( ${r_block2} ) ) `;
      params.push(r_block1_val);
      params.push(r_block2_val);
    } else {
      // are 3
      let add_3_params = true;
      if (filter.j1 === 'OR' && filter.j2 === 'OR') {
        fcondition += ` ( ( ${r_block1} ) ${filter.j1} ( ${r_block2} ) ${filter.j2} ( ${r_block3} ) ) `;
      } else if (filter.j1 === 'AND' && filter.j2 === 'AND') {
        fcondition += ` ( ( ${r_block1} ) ${filter.j1} ( ${r_block2} ) ${filter.j2} ( ${r_block3} ) ) `;
      } else if (filter.j1 === 'AND' && filter.j2 === 'OR') {
        fcondition += ` ( ( ${r_block1} ) ${filter.j1} ( ( ${r_block2} ) ${filter.j2} ( ${r_block3} ) ) ) `;
      } else if (filter.j1 === 'OR' && filter.j2 === 'AND') {
        fcondition += ` ( (( ${r_block1} ) ${filter.j1} ( ${r_block2} )) ${filter.j2} ( ${r_block3} ) ) `;
      } else if (filter.j1 === 'BETWEEN' && filter.j2 === 'OR' && r_block1_field === r_block2_field) {
        // search_with_between step8
        fcondition += ` ( ( ${r_block2_field} BETWEEN ? AND ?   ) ${filter.j2} ( ${r_block3} ) ) `;
      } else if (filter.j1 === 'BETWEEN' && filter.j2 === 'AND' && r_block1_field === r_block2_field) {
        fcondition += ` ( (  ${r_block2_field} BETWEEN ? AND ?   ) ${filter.j2} ( ${r_block3} ) ) `;
      } else if (filter.j1 === 'AND' && filter.j2 === 'BETWEEN' && r_block3_field === r_block2_field) {
        fcondition += ` ( ( ${r_block1} ) ${filter.j1} ( (  ${r_block2_field} BETWEEN ? AND ?  ) ) ) `;
      } else if (filter.j1 === 'OR' && filter.j2 === 'BETWEEN' && r_block3_field === r_block2_field) {
        fcondition += ` ( ( ${r_block1} ) ${filter.j1} (  ${r_block2_field} BETWEEN ? AND ?   ) ) `;
      } else if (filter.j1 === 'BETWEEN' && filter.j2 === 'BETWEEN' && r_block1_field === r_block2_field && r_block3_field === r_block2_field) {
        fcondition += ` ( (  ${r_block2_field} BETWEEN ? AND ?  ) OR (  ${r_block2_field} BETWEEN ? AND ?   ) ) `;
        params.push(r_block1_val);
        params.push(r_block2_val);
        params.push(r_block2_val);
        params.push(r_block3_val);
        add_3_params = false;
      } else {
        // It should return an error
        return { condition: '', params, error: 'Unexpected BETWEEN condition' };
      }
      if (add_3_params === true) {
        params.push(r_block1_val);
        params.push(r_block2_val);
        params.push(r_block3_val);
      }
    }

    if (condition !== '' && fcondition !== '') {
      condition = ` WHERE ${condition} AND ( ${fcondition} )`;
    } else if (condition !== '' && fcondition === '') {
      condition = ` WHERE ${condition}`;
    } else if (condition === '' && fcondition !== '') {
      condition = ` WHERE ( ${fcondition} )`;
    }
    console.log('base_datasource_filter_parser', {
      fcondition, params, condition, filter,
    });
    return { condition, params, error: false };
  }

  reset_cache() {
    cache.reset();
  }

  cached_query(sql, params, options, cb) {
    let cache_key = false;
    if (options.cache_ttl > 0) {
      cache_key = JSON.stringify({ sql, params });
      const cached = cache.get(cache_key);
      if (typeof cached !== 'undefined') {
        return cb(null, cached);
      }
    }
    DataUtil.query(sql, params, options, (err, data) => {
      if (cache_key && !err && options.cache_ttl > 0) {
        cache.set(cache_key, data, options.cache_ttl);
      }
      return cb(err, data);
    });
  }

  print_query(sql, params) {
    let temp = _.clone(sql);
    params.forEach((e) => {
      temp = temp.replace('?', ` '${e}' `);
    });
    return temp;
  }

  base_load_uploaded_excel_file(req, res, options, cb) {
    const post_file_name = options.post_file_name || 'upload';

    const file = req.files[post_file_name];
    let data = false;
    const map_fields = [];
    const lf = _.clone(this.get_fields().fields.array);
    _.filter(lf, (f) => typeof f.import !== 'undefined' && typeof f.import[this.id] !== 'undefined').forEach((f) => {
      f.import_key = f.import[this.id];
      map_fields.push(f);
    });
    const insert_rows = [];
    const workbook = XLSX.read(file.data, { type: 'buffer', cellDates: true, dateNF: 'yyyy/mm/dd;@' });
    workbook.SheetNames.forEach((sheetName) => {
      if (data === false) {
        data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
          header: options.file_header || 0,
          range: options.file_range || 0,
          defval: options.file_defval || '',
          raw: options.file_raw || false,
        });
        data.forEach((row) => {
          const i_row = {};
          map_fields.forEach((mf) => {
            if (typeof row[mf.import_key] != 'undefined') {
              i_row[mf.id] = row[mf.import_key];
            } else {
              i_row[mf.id] = mf.import[this.id].default || '';
            }
          });
          insert_rows.push(i_row);
        });
      }
    });
    cb(null, insert_rows, file);
  }

  base_insert_new_array(req, res, data_array, _options = {}, cb = false) {
    async.mapLimit(data_array, 1, (item, done) => {
      req.body.changes = item;
      req.params.id = constants.IDS.ADD_NEW_RECORD_ID;
      this.base_set(req, res, {}, (err2, result) => {
        done(err2, result);
      });
    }, (err3, _allDone) => {
      ResponseUtil.response(req, res, data_array, err3, cb);
    });
  }
}
module.exports = BaseModel;
