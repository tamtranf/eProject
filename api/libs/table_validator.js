const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const Nseq = require('nseq');
const md5 = require('md5');
const async = require('async');
const _ = require('lodash');
const debug = require('debug')('e-project:table_validator');
const config = require('../config/default');

const connection = mysql.createPool(config.db);

const COPY_DB_FIELDS_TO_FILE = false; // DO NOT COMMIT IT AS TRUE. ONLY AS FALSE.
const tabs = config.tables;

let loaded_tables = [];

let local_log = false;

// const dump_structure_time = 1000;
let TableValidatorAllowedFixes = 5;
let TableValidatorExecutedFixes = 0;
const TableValidator = {
  check_loaded: () => tabs.length <= loaded_tables.length,
  create_table_structure: (tab_name, cb) => {
    if (config.auto_create_tables !== true) {
      const err = `CAN NOT CREATE TABLE ${tab_name}, DUE config.auto_create_tables is not true. Change the config and run again.`;
      console.log(err);
      return cb(err);
    }
    TableValidatorExecutedFixes += 1;
    const tab_struct = fs.readFileSync(`./db_info/version_tables/table_${tab_name}.sql`, 'utf8');
    console.log('tab_struct', tab_struct);
    connection.query(tab_struct, [], (err, result) => {
      if (err === null) {
        console.log('TABLE ', tab_name, ' NO NOT EXIST AT DB, SO EXECUTED THE CREATION, TRY TO RESTART THE APP TO SEE THE RESULT.');
      } else {
        console.log('TABLE ', tab_name, ' NO NOT EXIST AT DB, AND FAILED WHEN TRY TO CREATE:', err);
      }
      cb(err, result);
    });
  },

  recreate_indexes: (tab_name, cb) => {
    const file_name = `./db_info/version_tables/idx_${tab_name}.sql`;
    // DROP Auto increment.
    let s1 = 'SELECT CONCAT( \'ALTER TABLE `\', TABLE_NAME, \'` \', \'MODIFY COLUMN `\', COLUMN_NAME, \'` \', IF(UPPER(DATA_TYPE) = \'INT\', ';
    s1 += ' REPLACE( SUBSTRING_INDEX( UPPER(COLUMN_TYPE), \')\', 1 ), \'INT\', \'INTEGER\' ), UPPER(COLUMN_TYPE) ), \') UNSIGNED NOT NULL;\' ) AS \'row\' ';
    s1 += ' FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND EXTRA = UPPER(\'AUTO_INCREMENT\') ORDER BY TABLE_NAME ASC;';
    // DROP Indexes
    let s2 = 'SELECT CONCAT( \'ALTER TABLE `\', TABLE_NAME, \'` \', GROUP_CONCAT( DISTINCT CONCAT( \'DROP \', IF(UPPER(INDEX_NAME) = \'PRIMARY\', \'PRIMARY KEY\', ';
    s2 += ' CONCAT(\'INDEX `\', INDEX_NAME, \'`\') ) ) SEPARATOR \', \' ), \';\' ) AS \'row\' FROM information_schema.STATISTICS  ';
    s2 += ' WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? GROUP BY TABLE_NAME ORDER BY TABLE_NAME ASC ';

    connection.query(s1, [config.db.database, tab_name], (err1, r1, _fields1) => {
      connection.query(s2, [config.db.database, tab_name], (err2, r2, _fields2) => {
        const indexes_to_create = fs.readFileSync(file_name, 'utf8');
        const ops = [];
        r1.forEach((r) => {
          ops.push(r.row);
        });
        r2.forEach((r) => {
          ops.push(r.row);
        });
        if (typeof indexes_to_create === 'undefined') {
          // There are no the file to create new indexes,
          // so abort here
          return cb(`No indexes idx_${tab_name}.sql file found. Current indexes at ${tab_name} (if exist) was not dropped`);
        }

        indexes_to_create.split('\n').forEach((line) => {
          if (line.length > 1) ops.push(line);
        });
        async.mapLimit(ops,
          1,
          (d, map_cb) => {
            console.log(' recreate_indexes starting op', d);
            // IN case of error, it will continue
            connection.query(d, [], (err, _result) => {
              if (err) {
                console.log('ERROR', err);
              }
              console.log(' recreate_indexes returning on op', d);
              map_cb(null, err === null);
            });
          },
          (err, result) => {
            debug('OPS done', result);
            cb();
          });
      });
    });
  },
  add_field: (data, cb) => {
    // ALTER TABLE `application_control` ADD `salt` VARCHAR(64) NULL AFTER `memo`;
    TableValidator.add_change_field(data, 'ADD', cb);
  },
  change_field: (data, cb) => {
    TableValidator.add_change_field(data, 'CHANGE', cb);
  },
  add_change_field: (data, mode, cb) => {
    // Note it do not support to rename fields, if need to rename will need a new instruction file.
    // And this file should run in advance or will cause the new field to be created.
    const add_null_default = (data2) => {
      let temp_sql = data2.expected.Null.toUpperCase() === 'YES' ? ' NULL' : ' NOT NULL ';
      if (data2.expected.Default === null) {
        temp_sql += data2.expected.Null.toUpperCase() === 'YES' ? ' DEFAULT NULL ' : '';
      } else if (data2.expected.Default === 'CURRENT_TIMESTAMP') {
        temp_sql += ` DEFAULT ${data2.expected.Default} `;
      } else {
        temp_sql += ` DEFAULT '${data2.expected.Default}' `;
      }
      return temp_sql;
    };

    let sql = `ALTER TABLE \`${data.table}\` ${mode} \`${data.expected.Field}\` `;
    if (mode === 'CHANGE') {
      sql += ` \`${data.expected.Field}\` `;
    }
    if (data.expected.Type.indexOf('varchar') === 0) {
      sql += `${data.expected.Type} CHARACTER SET utf8 COLLATE 'utf8_general_ci' `;
      sql += add_null_default(data);
    } else {
      sql += data.expected.Type;
      if (data.expected.Extra !== null && data.expected.Extra.length > 0) {
        sql += ` ${data.expected.Extra} `;
      }
      sql += add_null_default(data);
    }
    if (mode === 'CHANGE') {
      sql += ';';
    } else {
      sql += `AFTER ${data.previous.Field};`;
    }

    console.log('CHANGING TABLE STRUCTURE: ', sql);
    connection.query(sql, [], (err, result) => {
      if (err) {
        console.log('ERROR', err);
      }
      cb(err, result);
    });
  },
  fix_problems: ({ warning_errors, critical_errors }, cb) => {
    console.log('Starting at fix_problems');
    // To add new indexes, uncomment this line, start the app, (error is OK), and copy last_info.json to version_info.json
    // return cb();
    if (COPY_DB_FIELDS_TO_FILE) {
      return cb();
    }
    const to_fix_array = [];
    let err_id = 1;
    critical_errors.forEach((err) => {
      err_id += 1;
      err.err_id = err_id;
      to_fix_array.push(err);
    });
    warning_errors.forEach((err) => {
      err_id += 1;
      err.err_id = err_id;
      to_fix_array.push(err);
    });
    const recreated_indexes = {};

    async.mapLimit(to_fix_array,
      1,
      (d, map_cb) => {
        if (config.auto_create_and_change_fields !== true) {
          const err = 'CAN NOT CHANGE FIELDS OR INDEXES DUE config.auto_create_and_change_fields is not true.';
          console.log(err);
          return cb(err);
        }
        console.log('fix_problems', d);
        switch (d.type) {
        case 'Type':
        case 'Null':
        case 'Default':
        case 'Extra':
          // Need to recreate the field
          TableValidator.change_field(d, (_err, _data) => {
            TableValidatorExecutedFixes += 1;
            map_cb();
          });

          break;
        case 'Key':
          // Need to recreate the table indexes
          console.log('DEBUG fix_problems at Key stage 1', recreated_indexes[d.table]);
          if (typeof recreated_indexes[d.table] === 'undefined') {
            console.log('DEBUG fix_problems at Key stage 2');
            TableValidator.recreate_indexes(d.table, (_err, _data) => {
              console.log('DEBUG fix_problems at Key stage 3');
              recreated_indexes[d.table] = true;
              TableValidatorExecutedFixes += 1;
              map_cb();
            });
          }
          // else{
          //     console.log("DEBUG fix_problems at Key stage 4");
          //     map_cb();
          // }
          break;
        case 'field_do_not_exist':
          // Need to add the field
          TableValidator.add_field(d, (_err, _data) => {
            TableValidatorExecutedFixes += 1;
            map_cb();
          });

          break;
          // case "table_do_not_exist":
          //     // Need to recreate the tables
          //     TableValidator.create_table_structure(d.table_name, (err, data) => {
          //         TableValidatorExecutedFixes += 1;
          //         map_cb();
          //     })
          //     break;

        default:
          console.log('Problem can not be fixed', d);
          map_cb();
          break;
        }
      },
      (_err, _data) => {
        cb();
      });
  },
  dump_structure: (tab_name, cb) => cb(null),
  create_database: (cb) => {
    if (config.auto_create_database !== true) {
      const err = `CAN NOT CREATE DATABASE ${config.db.database}, DUE config.auto_create_database is not true. If need to create the database, change the config and run again.`;
      console.log(err);
      return cb(err);
    }
    console.log('Creating Database:', config.db.database);
    const sql = `CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;`;
    const temp_connection = mysql.createPool({
      connectionLimit: 2,
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      // database: config.db.database,
      dateStrings: config.db.dateStrings,
    });
    temp_connection.query(sql, [], (err, _result, _fields) => {
      TableValidatorExecutedFixes += 1;
      debug('DB CREATE RESULT', err);
      cb(err);
    });
  },
  create_views: (cb) => {
    const view_dir = './db_info/views/';
    if (fs.existsSync(view_dir) === true) {
      const local_db_config = _.clone(config.db);
      local_db_config.multipleStatements = true;
      const local_connection = mysql.createConnection(local_db_config);
      async.mapLimit(fs.readdirSync(view_dir),
        1,
        (f, done) => {
          if (f.toLowerCase().indexOf('.sql') > 0) {
            console.log('create_views', f);
            const sql = fs.readFileSync(view_dir + f, 'utf8');
            local_connection.query(sql, [], (err, _result, _fields) => {
              done(err);
            });
          } else {
            return done();
          }
        },
        (err, _allDone) => {
          local_connection.end();
          return cb(err);
        });
    } else {
      return cb();
    }
  },
  run_setup_scripts: (cb) => {
    const setup_scripts_dir = './db_info/setup_scripts/';
    if (fs.existsSync(setup_scripts_dir) === false) {
      return cb();
    }
    async.mapLimit(fs.readdirSync(setup_scripts_dir), 1, (s, done) => {
      const script_path = path.join(__dirname, '../', setup_scripts_dir, s);
      console.log('run_setup_scripts: ', { script_path });

      const imp_script = require(script_path);
      console.log('run_setup_scripts: ', { imp_script });
      if (imp_script.condition.mode === 'field_exist') {
        const sql = `SHOW COLUMNS FROM \`${imp_script.condition.table}\` LIKE '${imp_script.condition.field}'`;
        connection.query(sql, [], (err, data) => {
          if (err) {
            if (imp_script.condition && imp_script.condition.table_condition === 'ignore_if_table_not_exist' && (err.code === 'ER_NO_SUCH_TABLE' || err.code === 'ER_TABLE_EXISTS_ERROR')) {
              console.log('IGNORING DUE TABLE DO NOT EXIST: ', s);
              return done();
            }
            // console.log("ERROR HERE", imp_script.condition.table_condition , err.code, imp_script.table_condition === "ignore_if_table_not_exist" , err.code === "ER_NO_SUCH_TABLE" )
            return cb(err);
          }
          if (data && data.length > 0 && data[0].Field === imp_script.condition.field) {
            if (imp_script.action.mode === 'sql') {
              console.log('FIELD run_setup_scripts: ', 'Executing run_setup_scripts: ', imp_script.action.sql);
              connection.query(imp_script.action.sql, [], (err2, result) => {
                done(err2, result);
              });
            } else {
              console.log('FIELD run_setup_scripts: ', 'last imp_script', imp_script);
              throw new Error('run_setup_scripts action is not implemented');
            }
          } else {
            console.log('FIELD run_setup_scripts: ', 'It is OK, the field NOT exist or is not in the expected condition');
            return done();
          }
        });
      } else if (imp_script.condition.mode === 'index_exist') {
        const sql = `SHOW KEYS FROM \`${imp_script.condition.table}\` WHERE Key_name='${imp_script.condition.field}';`;
        connection.query(sql, [], (err, data) => {
          if (err) {
            return cb(err);
          }
          if (data && data.length > 0) {
            if (imp_script.action.mode === 'sql') {
              console.log('INDEX run_setup_scripts (index_exist): ', 'Executing run_setup_scripts (index_exist): ', imp_script.action.sql);
              connection.query(imp_script.action.sql, [], (err2, result) => {
                done(err || err2, result);
              });
            } else {
              console.log('INDEX run_setup_scripts (index_exist): ', 'last imp_script', imp_script);
              throw new Error('run_setup_scripts (index_exist) action is not implemented');
            }
          } else {
            console.log({ data, err });
            console.log('INDEX run_setup_scripts: ', 'It is OK, the field NOT exist or is not in the expected condition');
            return done();
          }
        });
      } else if (imp_script.condition.mode === 'index_not_exist') {
        const sql = `SHOW KEYS FROM \`${imp_script.condition.table}\` WHERE Key_name='${imp_script.condition.field}';`;
        connection.query(sql, [], (err, data) => {
          if (err) {
            return cb(err);
          }
          if (data && data.length > 0) {
            console.log({ data, err });
            console.log('INDEX run_setup_scripts (index_not_exist): ', 'It is OK, the field  exist or is not in the expected condition');
            return done();
          }
          if (imp_script.action.mode === 'sql') {
            console.log('INDEX run_setup_scripts(index_not_exist): ', 'Executing run_setup_scripts (index_not_exist): ', imp_script.action.sql);
            connection.query(imp_script.action.sql, [], (err2, result) => {
              done(err2, result);
            });
          } else {
            console.log('INDEX run_setup_scripts(index_not_exist): ', 'last imp_script', imp_script);
            throw new Error('run_setup_scripts (index_not_exist) action is not implemented');
          }
        });
      } else if (imp_script.condition.mode === 'run_script') {
        imp_script.script.run_script(connection, local_log, (err) => {
          done(err);
        });
      } else {
        console.log('run_setup_scripts: ', 'last imp_script', imp_script);
        throw new Error('run_setup_scripts condition is not implemented');
      }
    }, (err, _allDone) => cb(err, null));
  },
  validate: (log, app, cb, time_on_failure = 2, requester = 'undefined') => {
    loaded_tables = [];
    const current_db_info = { tables: {}, indexes: {} };
    if (log !== false) {
      local_log = log;
    }
    if (time_on_failure > 120) {
      time_on_failure = 120;
    }

    connection.query('select now() as t ', [], (err, _result, _fields) => {
      time_on_failure += time_on_failure * 0.25;
      // Checks if MySql is UP
      if (err) {
        debug(err.code);
        if (err.code === 'ER_BAD_DB_ERROR') {
          console.error({ err }, 'MYSQL DATABASE NOT EXIST, CREATING IT', config.db.database);
          console.log(`MYSQL DATABASE ${config.db.database} DO NOT EXIST, WILL TRY TO CREATE IT.`);
          TableValidator.create_database((_err) => {
            if (TableValidatorAllowedFixes > 0) {
              TableValidatorAllowedFixes -= 1;
              setTimeout(() => {
                TableValidator.validate(false, app, cb, time_on_failure, 'create_database');
              }, time_on_failure * 1000);
            } else {
              console.log('All tries to create the Database failed. Need an manual action.');
            }
          });
        } else {
          console.error({ err }, 'MYSQL SEEMS TO BE DOWN');
          console.log('MYSQL SEEMS TO BE DOWN, will retry in ', err.code, time_on_failure.toFixed(1), ' seconds');
          setTimeout(() => {
            TableValidator.validate(false, app, cb, time_on_failure, `err:${err.code}`);
          }, time_on_failure * 1000);
        }
      } else {
        // Get  all tables from DB
        connection.query('SHOW TABLES; ', [], (_err, tab_result) => {
          const db_tabs = [];
          tab_result.forEach((tab) => {
            const tab_name = tab[`Tables_in_${config.db.database}`];
            debug('loading', tab_name);
            db_tabs.push(tab_name);
          });

          // For each TAB
          async.mapLimit(tabs, 1, (d, map_cb) => {
            // for each tab
            console.log('Validating ', d, ' (requester:', requester, ')');

            // If Tab is not found
            if (db_tabs.indexOf(d) < 0) {
              // Try to create the table
              TableValidator.create_table_structure(d, (err2) => map_cb(err2, null));
            } else {
              // If table is found
              // 1 - get all fields
              connection.query(`SHOW FIELDS FROM ${d}`, [], (err2, result, _fields2) => {
                if (err2) {
                  console.log({ err2 });
                  console.log(`CAN NOT START DUE TO PROBLEM AT MYSQL. AT SHOW FIELDS FROM ${d}`);
                  return map_cb(err2, null);
                }
                // 2 -  Get all Index
                connection.query(`SHOW INDEX FROM ${d}`, [], (err_idx, _result_idx, _fields_idx) => {
                  // 3 - Dump structure to reuse if needed.
                  TableValidator.dump_structure(d, (dump_err) => {
                    if (dump_err || err_idx) {
                      console.log({ err });
                      console.log('CAN NOT START DUE TO PROBLEM AT MYSQL. Failed to dump or to get Indexes ');
                      return map_cb(err, null);
                    }
                    // Load att tables details into  current_db_info
                    // var cols = {}
                    current_db_info.tables[d] = {};
                    current_db_info.indexes[d] = {};
                    result.forEach((f) => {
                      current_db_info.tables[d][f.Field] = f;
                      // type = f.Type;
                      // if (type.indexOf('(') > 0) {
                      //   type = type.split('(')[0];
                      // }
                      // cols[f.Field] = { type: type }
                    });
                    loaded_tables.push(d);
                    return map_cb(err, null);
                  });
                });
              });
            }
          }, (err3, _done) => {
            console.log('Tables exist validated ', {
              err3, check_loaded: TableValidator.check_loaded(), tabs_length: tabs.length, loaded_tables_length: loaded_tables.length,
            });
            // all done
            if (!err && TableValidator.check_loaded()) {
              console.log('Tables loaded with success.');
              console.log('Now will validate each field.');
              app.page_started = true;
              console.log('Starting validation.');
              TableValidator.validate_tables(current_db_info, (err5, _result2) => {
                if (err5 === 'PROBLEMS_FIXED') {
                  return TableValidator.validate(false, app, cb, time_on_failure, 'PROBLEMS_FIXED');
                }
                // Next will validate if default admin user exist.
                TableValidator.validate_admin_user((usr_err) => cb(err5 || usr_err));
              });
            } else {
              if (TableValidatorAllowedFixes > 0 && TableValidator.check_loaded() === false) {
                TableValidatorAllowedFixes -= 1;
                console.log('Found some problems, will try again.');
                return TableValidator.validate(false, app, cb, time_on_failure, 'TableValidatorAllowedFixes');
              }
              if (err === null) {
                console.log('CAN NOT START THE APPLICATION, ERR:', err, ' check_loaded:', TableValidator.check_loaded(), ' TableValidatorAllowedFixes:', TableValidatorAllowedFixes);
              } else {
                console.log('CAN NOT START THE APPLICATION DUE THE ERROR: ', err);
              }
            }
          });
        });
      }
    });
  },
  compare_types: (a, b) => {
    if ((a === 'int(11)' && b === 'int') || (b === 'int(11)' && a === 'int')) {
      return false;
    } if ((a === 'int(11) unsigned' && b === 'int unsigned') || (b === 'int(11) unsigned' && a === 'int unsigned')) {
      return false;
    } if ((a === 'int(10) unsigned' && b === 'int unsigned') || (b === 'int(10) unsigned' && a === 'int unsigned')) {
      return false;
    } if ((a === 'int(10)' && b === 'int') || (b === 'int(10)' && a === 'int')) {
      return false;
    } if ((a === 'smallint(6)' && b === 'smallint') || (b === 'smallint(6)' && a === 'smallint')) {
      return false;
    } if ((a === 'tinyint(4)' && b === 'tinyint') || (b === 'tinyint(4)' && a === 'tinyint')) {
      return false;
    }

    if ((b === 'DEFAULT_GENERATED on update CURRENT_TIMESTAMP' && a === 'on update CURRENT_TIMESTAMP')) {
      return false;
    }
    if ((a === 'DEFAULT_GENERATED on update CURRENT_TIMESTAMP' && b === 'on update CURRENT_TIMESTAMP')) {
      return false;
    }
    return a !== b;
  },
  validate_admin_user: (cb) => {
    (new Nseq()).do([
      (self) => {
        if (config.tables.indexOf('master_user') > -1 && config.tables.indexOf('master_user_permission') > -1 && config.tables.indexOf('master_entity') > -1) {
          connection.query('select count(*) as qty from master_user where user_name = ?', [config.admin_user.username], (err, rows_admin) => {
            if (err) {
              throw err;
            }
            if ((rows_admin[0].qty < 1 && config.admin_user.mode === 'admin')) {
              const sql = 'INSERT INTO master_user (user_name,password,full_name,last_login,status,is_super_admin) VALUES (?,?,?,now(),1,1)';
              const params = [config.admin_user.username, md5(config.admin_user.default_password), config.admin_user.username];
              connection.query(sql, params, (err2, _user_inserted) => {
                if (err2) {
                  throw err2;
                }
                const sql2 = 'REPLACE INTO master_entity (entity_code,entity_name) VALUES (?,?)';
                const params2 = [config.admin_user.default_entity, config.admin_user.default_entity];
                connection.query(sql2, params2, (err3, _entity_inserted) => {
                  if (err3) {
                    throw err3;
                  }
                  const sql3 = 'REPLACE INTO master_user_permission (user_name,entity_code,acl_role) VALUES (?,?,\'ADMIN\')';
                  const params3 = [config.admin_user.username, config.admin_user.default_entity];
                  connection.query(sql3, params3, (err4, _master_user_permission) => {
                    if (err4) {
                      throw err4;
                    }
                    self.next();
                  });
                });
              });
            } else {
              self.next();
            }
          });
        } else {
          self.next();
        }
      },
      (self) => {
        if (config.tables.indexOf('master_dev') > -1) {
          connection.query('select count(*) as qty from master_dev where user_id = ?', [config.admin_user.username], (err, rows_admin) => {
            if (err) {
              throw err;
            }
            connection.query('select count(*) as qty from master_dev where role = ? or role = ? or user_id = ?', ['管理責任者', '保守担当', config.admin_user.username], (err3, rows_any_admin) => {
              if (err3) {
                throw err3;
              }
              if ((rows_admin[0].qty < 1 && config.admin_user.mode === 'admin') || (rows_any_admin[0].qty < 1 && config.admin_user.mode === 'any_admin')) {
                require('../models/master_dev').local_add_user({
                  password: config.admin_user.default_password,
                  user_id: config.admin_user.username,
                  role: config.admin_user.role,
                  company: config.admin_user.company,
                  user_shimei: 'Admin User',
                },
                (err2) => {
                  if (err2 === null) {
                    console.log('Default user ', config.admin_user.username, ' was created with default password. Please change the password.');
                  } else {
                    console.log('Can not create the ADMIN user.');
                  }
                  TableValidatorExecutedFixes += 1;
                  cb(err2);
                });
              } else {
                console.log('Admin user validated.');
                self.next();
              }
            });
          });
        } else {
          return self.next();
        }
      },
      (_self) => {
        cb();
      },
    ]);
  },
  validate_tables: (current_db_info, cb) => {
    console.log('Running tables structure validation.');
    const critical_errors = [];
    const warning_errors = [];
    // debug("current_db_info", current_db_info);

    if (fs.existsSync('./db_info/') === false) {
      fs.mkdirSync('./db_info/');
    }
    // Save the last info, to be used to compare, and also can be moved to version_info
    // fs.writeFileSync('./db_info/last_info.json', JSON.stringify(current_db_info, null, 4), 'utf-8');
    // Check if version info exist, to then compare.
    if (fs.existsSync('./db_info/version_info.json') === true) {
      const version_info = JSON.parse(fs.readFileSync('./db_info/version_info.json', 'utf-8'));

      // For each table in the version_info
      for (const tab in version_info.tables) {
        debug('checking tab', tab);

        if (typeof current_db_info.tables[tab] === 'undefined') {
          critical_errors.push({
            message: `Table ${tab} don't exist. (May need to add to config.js)`,
            type: 'table_do_not_exist',
            table: tab,
          });
        } else {
          // For each field.
          let previous_field = null;
          for (const field_name in version_info.tables[tab]) {
            const field = version_info.tables[tab][field_name];
            // Check if the field exists
            if (typeof current_db_info.tables[tab][field_name] === 'undefined') {
              critical_errors.push({
                message: `Field '${field_name}' at table '${tab}' don't exist.`,
                type: 'field_do_not_exist',
                table: tab,
                field: field_name,
                expected: field,
                previous: previous_field,
              });
            } else {
              // for each propriety in the fields.
              for (const prop in field) {
                // Check if the propriety exist.
                if (TableValidator.compare_types(current_db_info.tables[tab][field_name][prop], field[prop])) {
                  let msg = `Property '${prop}' of field '${field_name}' at table '${tab}', with value (${current_db_info.tables[tab][field_name][prop]}) `;
                  msg += `is different from expected (${version_info.tables[tab][field_name][prop]}) .`;
                  warning_errors.push({
                    message: msg,
                    type: prop,
                    table: tab,
                    field: field_name,
                    expected: version_info.tables[tab][field_name],
                    current: current_db_info.tables[tab][field_name],
                  });
                }
              }
            }
            previous_field = field;
          }
        }
      }
    }
    console.log('Will run TableValidator.fix_problems');
    TableValidator.fix_problems({ warning_errors, critical_errors }, () => {
      const e = 'ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR';
      const w = 'WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING ';
      const l = '-----------------------------------------------------------------';

      if (TableValidatorExecutedFixes > 0 && TableValidatorAllowedFixes > 0) {
        TableValidatorAllowedFixes -= 1;
        console.log('Fixed some problems, will validated again');
        cb('PROBLEMS_FIXED');
      } else {
        let err = null;
        if (critical_errors.length > 0) {
          const msg = 'Critical errors was found. Fix it before from continue!';
          console.log(e);
          console.log(msg);
          critical_errors.forEach((err2) => {
            console.log(`    ${l}`);
            console.log(`    ${err2.message}`);
            console.log(`    ${l}`);
          });
          console.log(e);
          console.log(msg);
          err = 'CRITICAL ERRORS';
        } else if (warning_errors.length > 0) {
          const msg = 'Errors was found. You can continue but unexpected problems may occur! Try to fix it before from continue.';
          console.log(w);
          console.log(msg);
          warning_errors.forEach((err2) => {
            console.log(`    ${l}`);
            console.log(`    ${err2.message}`);
            console.log(`    ${l}`);
          });
          console.log(w);
          console.log(msg);
          err = 'WARNING ERRORS';
        } else {
          console.log('Tables validated with success.');

          err = null;
        }
        return cb(err, null);
      }
    });
  },
};

module.exports = TableValidator;
