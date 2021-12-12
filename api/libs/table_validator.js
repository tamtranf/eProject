const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const config = require('../config/default');
const async = require('async');
const _ = require('lodash');

var debug = require('debug')('esma:table_validator');
var mysqlDump = require('mysqldump');
var connection = mysql.createPool(config.db);

/**
 * FIXME: Instead of this, it should have a dedicated command to allow to copy from DB to  File.
 * This command should have parameters:
 * No params, means all tables, indexes and data.
 * first param is  the table name, so only process this table
 * second paramters is the mode, all is by default, index or structure are also options. Or only check is also possible,
 * 3rd parameter is to copy a single field.
 *
 *
 *
 * If COPY_DB_FIELDS_TO_FILE is set to false, then it will load the table structure from file to DB.
 * But if set to true, then will copy from DB to file.
 */
var COPY_DB_FIELDS_TO_FILE = false; // DO NOT COMMIT IT AS TRUE. ONLY AS FALSE.
var tabs = config.tables;

var loaded_tables = [];

var local_log = false;

var dump_structure_time = 1000;
var TableValidatorAllowedFixes = 5;
var TableValidatorExecutedFixes = 0;
var TableValidator = {
  check_loaded: () => {
    return tabs.length <= loaded_tables.length;
  },
  create_table_structure: (tab_name, cb) => {
    if (config.auto_create_tables != true) {
      var err = 'CAN NOT CREATE TABLE ' + tab_name + ', DUE config.auto_create_tables is not true. Change the config and run again.';
      console.log(err);
      return cb(err);
    }
    TableValidatorExecutedFixes++;
    var tab_struct = fs.readFileSync('./db_info/version_tables/table_' + tab_name + '.sql', 'utf8');
    console.log('tab_struct', tab_struct);
    connection.query(tab_struct, [], function (err, result) {
      if (err == null) {
        console.log('TABLE ', tab_name, ' NO NOT EXIST AT DB, SO EXECUTED THE CREATION, TRY TO RESTART THE APP TO SEE THE RESULT.');
      } else {
        console.log('TABLE ', tab_name, ' NO NOT EXIST AT DB, AND FAILED WHEN TRY TO CREATE:', err);
      }
      cb(err, result);
    });
  },
  // dump_recreate_indexes: (tab_name, cb) => {
  //   var buff = '';
  //   var file_name = './db_info/last_tables/idx_' + tab_name + '.sql';
  //   // DROP Auto increment.
  //   var s1 = "SELECT CONCAT( 'ALTER TABLE `', TABLE_NAME, '` ', 'MODIFY COLUMN `', COLUMN_NAME, '` ', IF(UPPER(DATA_TYPE) = 'INT', REPLACE( SUBSTRING_INDEX( UPPER(COLUMN_TYPE), ')', 1 ), 'INT', 'INTEGER' ), UPPER(COLUMN_TYPE) ), ') UNSIGNED NOT NULL;' ) AS 'row' FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND EXTRA = UPPER('AUTO_INCREMENT') ORDER BY TABLE_NAME ASC;";
  //   // DROP Indexes
  //   var s2 = "SELECT CONCAT( 'ALTER TABLE `', TABLE_NAME, '` ', GROUP_CONCAT( DISTINCT CONCAT( 'DROP ', IF(UPPER(INDEX_NAME) = 'PRIMARY', 'PRIMARY KEY', CONCAT('INDEX `', INDEX_NAME, '`') ) ) SEPARATOR ', ' ), ';' ) AS 'row' FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? GROUP BY TABLE_NAME ORDER BY TABLE_NAME ASC ";

  //   // Indexes
  //   var s3 = "SELECT CONCAT( 'ALTER TABLE `', TABLE_NAME, '` ', 'ADD ', IF(NON_UNIQUE = 1, CASE UPPER(INDEX_TYPE) WHEN 'FULLTEXT' THEN 'FULLTEXT INDEX' WHEN 'SPATIAL' THEN 'SPATIAL INDEX' ELSE CONCAT('INDEX `', INDEX_NAME, '` USING ', INDEX_TYPE ) END, IF(UPPER(INDEX_NAME) = 'PRIMARY', CONCAT('PRIMARY KEY USING ', INDEX_TYPE ), CONCAT('UNIQUE INDEX `', INDEX_NAME, '` USING ', INDEX_TYPE ) ) ), '(', GROUP_CONCAT( DISTINCT CONCAT('`', COLUMN_NAME, '`') ORDER BY SEQ_IN_INDEX ASC SEPARATOR ', ' ), ');' ) AS 'row' FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ?  AND TABLE_NAME = ? GROUP BY TABLE_NAME, INDEX_NAME,NON_UNIQUE,INDEX_NAME,INDEX_TYPE,INDEX_NAME ORDER BY TABLE_NAME ASC, INDEX_NAME ASC ";

  //   // Auto increment.
  //   var s4 = "SELECT CONCAT( 'ALTER TABLE `', TABLE_NAME, '` ', 'MODIFY COLUMN `', COLUMN_NAME, '` ', IF(UPPER(DATA_TYPE) = 'INT', REPLACE( SUBSTRING_INDEX( UPPER(COLUMN_TYPE), ')', 1 ), 'INT', 'INTEGER' ), UPPER(COLUMN_TYPE) ), ') UNSIGNED NOT NULL AUTO_INCREMENT;' ) AS 'row' FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND EXTRA = UPPER('AUTO_INCREMENT') ORDER BY TABLE_NAME ASC ";

  //   connection.query(s1, [config.db.database, tab_name], function (err1, r1, fields) {
  //     connection.query(s2, [config.db.database, tab_name], function (err2, r2, fields) {
  //       connection.query(s3, [config.db.database, tab_name], function (err3, r3, fields) {
  //         connection.query(s4, [config.db.database, tab_name], function (err4, r4, fields) {
  //           if (err3 != null) {
  //             console.log('err3', err3);
  //           }
  //           r3.forEach((r) => {
  //             buff += r['row'] + '\n';
  //           });
  //           if (err4 != null) {
  //             console.log('err4', err4);
  //           }
  //           r4.forEach((r) => {
  //             buff += r['row'] + '\n';
  //           });
  //           // console.log(buff);
  //           fs.writeFileSync(file_name, buff, 'utf8');
  //           cb(err3 || err4);
  //         });
  //       });
  //     });
  //   });
  // },
  recreate_indexes: (tab_name, cb) => {
    var indexes_to_drop = '';
    var file_name = './db_info/version_tables/idx_' + tab_name + '.sql';
    // DROP Auto increment.
    var s1 = "SELECT CONCAT( 'ALTER TABLE `', TABLE_NAME, '` ', 'MODIFY COLUMN `', COLUMN_NAME, '` ', IF(UPPER(DATA_TYPE) = 'INT', REPLACE( SUBSTRING_INDEX( UPPER(COLUMN_TYPE), ')', 1 ), 'INT', 'INTEGER' ), UPPER(COLUMN_TYPE) ), ') UNSIGNED NOT NULL;' ) AS 'row' FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND EXTRA = UPPER('AUTO_INCREMENT') ORDER BY TABLE_NAME ASC;";
    // DROP Indexes
    var s2 = "SELECT CONCAT( 'ALTER TABLE `', TABLE_NAME, '` ', GROUP_CONCAT( DISTINCT CONCAT( 'DROP ', IF(UPPER(INDEX_NAME) = 'PRIMARY', 'PRIMARY KEY', CONCAT('INDEX `', INDEX_NAME, '`') ) ) SEPARATOR ', ' ), ';' ) AS 'row' FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? GROUP BY TABLE_NAME ORDER BY TABLE_NAME ASC ";

    connection.query(s1, [config.db.database, tab_name], function (err, r1, fields) {
      connection.query(s2, [config.db.database, tab_name], function (err, r2, fields) {
        // 3 e 4 tem que ler dos arquivos, eh soh um na verdade.
        var indexes_to_create = fs.readFileSync(file_name, 'utf8');
        var ops = [];
        r1.forEach((r) => {
          ops.push(r['row']);
        });
        r2.forEach((r) => {
          ops.push(r['row']);
        });
        if (typeof indexes_to_create == 'undefined') {
          // There are no the file to create new indexes,
          // so abort here
          return cb('No indexes idx_' + tab_name + '.sql file found. Current indexes at ' + tab_name + ' (if exist) was not dropped');
        }

        indexes_to_create.split('\n').forEach((line) => {
          if (line.length > 1) ops.push(line);
        });
        async.mapLimit(
          ops,
          1,
          (d, map_cb) => {
            console.log(' recreate_indexes starting op', d);
            // IN case of erro, it will continue
            connection.query(d, [], function (err, result) {
              if (err) {
                console.log('ERROR', err);
              }
              console.log(' recreate_indexes returning on op', d);
              map_cb(null, err == null);
            });
          },
          (err, result) => {
            debug('OPS done', result);
            cb();
          }
        );
      });
    });
  },
  add_field: (data, cb) => {
    //ALTER TABLE `application_control` ADD `salt` VARCHAR(64) NULL AFTER `memo`;
    TableValidator.add_change_field(data, 'ADD', cb);
  },
  change_field: (data, cb) => {
    TableValidator.add_change_field(data, 'CHANGE', cb);
  },
  add_change_field: (data, mode, cb) => {
    // Note it do not support to rename fields, if need to rename will need a new instruction file.
    // And this file should run in advance or will cause the new field to be created.
    var add_null_default = (data) => {
      var temp_sql = data.expected.Null.toUpperCase() == 'YES' ? ' NULL' : ' NOT NULL ';
      if (data.expected.Default == null) {
        temp_sql += data.expected.Null.toUpperCase() == 'YES' ? ' DEFAULT NULL ' : '';
      } else if (data.expected.Default == 'CURRENT_TIMESTAMP') {
        temp_sql += ' DEFAULT ' + data.expected.Default + ' ';
      } else {
        temp_sql += " DEFAULT '" + data.expected.Default + "' ";
      }
      return temp_sql;
    };

    var sql = 'ALTER TABLE `' + data.table + '` ' + mode + ' `' + data.expected.Field + '` ';
    if (mode == 'CHANGE') {
      sql += ' `' + data.expected.Field + '` ';
    }
    if (data.expected.Type.indexOf('varchar') == 0) {
      sql += data.expected.Type + " CHARACTER SET utf8 COLLATE 'utf8_general_ci' ";
      sql += add_null_default(data);
    } else {
      sql += data.expected.Type;
      if (data.expected.Extra != null && data.expected.Extra.length > 0) {
        sql += ' ' + data.expected.Extra + ' ';
      }
      sql += add_null_default(data);
    }
    if (mode == 'CHANGE') {
      sql += ';';
    } else {
      sql += 'AFTER ' + data.previous.Field + ';';
    }

    console.log('CHANGING TABLE STRUCTURE: ', sql);
    connection.query(sql, [], function (err, result) {
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
    var to_fix_array = [];
    var err_id = 1;
    critical_errors.forEach((err) => {
      err.err_id = err_id++;
      to_fix_array.push(err);
    });
    warning_errors.forEach((err) => {
      err.err_id = err_id++;
      to_fix_array.push(err);
    });
    var recreated_indexes = {};

    async.mapLimit(
      to_fix_array,
      1,
      (d, map_cb) => {
        if (config.auto_create_and_change_fields != true) {
          var err = 'CAN NOT CHANGE FIELDS OR INDEXES DUE config.auto_create_and_change_fields is not true.';
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
            TableValidator.change_field(d, (err, data) => {
              TableValidatorExecutedFixes++;
              map_cb();
            });

            break;
          case 'Key':
            // Need to recreate the table indexes
            console.log('DEBUG fix_problems at Key stage 1', recreated_indexes[d.table]);
            if (typeof recreated_indexes[d.table] == 'undefined') {
              console.log('DEBUG fix_problems at Key stage 2');
              TableValidator.recreate_indexes(d.table, (err, data) => {
                console.log('DEBUG fix_problems at Key stage 3');
                recreated_indexes[d.table] = true;
                TableValidatorExecutedFixes++;
                map_cb();
              });
            }
            //else{
            //     console.log("DEBUG fix_problems at Key stage 4");
            //     map_cb();
            // }
            break;
          case 'field_do_not_exist':
            // Need to add the field
            TableValidator.add_field(d, (err, data) => {
              TableValidatorExecutedFixes++;
              map_cb();
            });

            break;
          // case "table_do_not_exist":
          //     // Need to recreate the tables
          //     TableValidator.create_table_structure(d.table_name, (err, data) => {
          //         TableValidatorExecutedFixes++;
          //         map_cb();
          //     })
          //     break;

          default:
            console.log('Problem can not be fixed', d);
            map_cb();
            break;
        }
      },
      (err, data) => {
        cb();
      }
    );
  },
  dump_structure: (tab_name, cb) => {
    return  cb(null)
    // dump_structure_time = dump_structure_time + 3000;
    // setTimeout(() => {
    if (fs.existsSync('./db_info/last_tables/') == false) {
      fs.mkdirSync('./db_info/last_tables/');
    }
    mysqlDump(
      {
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
        tables: [tab_name],
        data: false,
        ifNotExist: true,
        autoIncrement: false,
        dest: './db_info/last_tables/table_' + tab_name + '.sql',
      },
      function (err) {
        if (err) {
          console.log('ERROR TO CREATE DUMP OF TABLES', tab_name, err);
        } else {
          debug('Created structure for ', tab_name);
        }
        return cb(null)
        // return TableValidator.dump_recreate_indexes(tab_name, cb);
      }
    );
    // }, dump_structure_time);
  },
  create_database: (cb) => {
    if (config.auto_create_database != true) {
      var err = 'CAN NOT CREATE DATABASE ' + config.db.database + ', DUE config.auto_create_database is not true. If need to create the database, change the config and run again.';
      console.log(err);
      return cb(err);
    }
    console.log('Creating Database:', config.db.database);
    var sql = 'CREATE DATABASE IF NOT EXISTS `' + config.db.database + '` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;';
    config.db;
    var temp_connection = mysql.createPool({
      connectionLimit: 2,
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      // database: config.db.database,
      dateStrings: config.db.dateStrings,
    });
    temp_connection.query(sql, [], function (err, result, fields) {
      TableValidatorExecutedFixes++;
      debug('DB CREATE RESULT', err);
      cb(err);
    });
  },
  create_views: (cb) => {
    var view_dir = './db_info/views/';
    if (fs.existsSync(view_dir) == true) {
      var local_db_config = _.clone(config.db);
      local_db_config.multipleStatements = true;
      var local_connection = mysql.createConnection(local_db_config);
      async.mapLimit(
        fs.readdirSync(view_dir),
        1,
        (f, done) => {
          if (f.toLowerCase().indexOf('.sql') > 0) {
            console.log('create_views', f);
            var sql = fs.readFileSync(view_dir + f, 'utf8');
            local_connection.query(sql, [], function (err, result, fields) {
              done(err);
            });
          } else {
            return done();
          }
        },
        (err, allDone) => {
          local_connection.end();
          return cb(err);
        }
      );
    } else {
      return cb();
    }
  },
  run_setup_scripts: (cb) => {
    var setup_scripts_dir = './db_info/setup_scripts/';
    async.mapLimit(
      fs.readdirSync(setup_scripts_dir),
      1,
      (s, done) => {
        var script_path = path.join(__dirname, '../', setup_scripts_dir, s);
        console.log('run_setup_scripts: ', { script_path });

        var imp_script = require(script_path);
        console.log('run_setup_scripts: ', { imp_script });
        if (imp_script.condition.mode == 'field_exist') {
          var sql = 'SHOW COLUMNS FROM `' + imp_script.condition.table + "` LIKE '" + imp_script.condition.field + "'";
          connection.query(sql, [], (err, data) => {
            if (err) {
              if (imp_script.condition && imp_script.condition.table_condition == 'ignore_if_table_not_exist' && (err.code == 'ER_NO_SUCH_TABLE' || err.code == 'ER_TABLE_EXISTS_ERROR')) {
                console.log('IGNORING DUE TABLE DO NOT EXIST: ', s);
                return done();
              }
              // console.log("ERROR HERE", imp_script.condition.table_condition , err.code, imp_script.table_condition == "ignore_if_table_not_exist" , err.code == "ER_NO_SUCH_TABLE" )
              return cb(err);
            }
            if (data && data.length > 0 && data[0].Field == imp_script.condition.field) {
              if (imp_script.action.mode == 'sql') {
                console.log('FIELD run_setup_scripts: ', 'Executing run_setup_scripts: ', imp_script.action.sql);
                connection.query(imp_script.action.sql, [], (err, result) => {
                  done(err, result);
                });
              } else {
                console.log('FIELD run_setup_scripts: ', 'last imp_script', imp_script);
                throw 'run_setup_scripts action is not implemented';
              }
            } else {
              console.log('FIELD run_setup_scripts: ', 'It is OK, the field NOT exist or is not in the expected condition');
              return done();
            }
          });
        } else if (imp_script.condition.mode == 'index_exist') {
          var sql = 'SHOW KEYS FROM `' + imp_script.condition.table + "` WHERE Key_name='" + imp_script.condition.field + "';";
          connection.query(sql, [], (err, data) => {
            if (err) {
              return cb(err);
            }
            if (data && data.length > 0) {
              if (imp_script.action.mode == 'sql') {
                console.log('INDEX run_setup_scripts (index_exist): ', 'Executing run_setup_scripts (index_exist): ', imp_script.action.sql);
                connection.query(imp_script.action.sql, [], (err, result) => {
                  done(err, result);
                });
              } else {
                console.log('INDEX run_setup_scripts (index_exist): ', 'last imp_script', imp_script);
                throw 'run_setup_scripts (index_exist) action is not implemented';
              }
            } else {
              console.log({ data, err });
              console.log('INDEX run_setup_scripts: ', 'It is OK, the field NOT exist or is not in the expected condition');
              return done();
            }
          });
        } else if (imp_script.condition.mode == 'index_not_exist') {
          var sql = 'SHOW KEYS FROM `' + imp_script.condition.table + "` WHERE Key_name='" + imp_script.condition.field + "';";
          connection.query(sql, [], (err, data) => {
            if (err) {
              return cb(err);
            }
            if (data && data.length > 0) {
              console.log({ data, err });
              console.log('INDEX run_setup_scripts (index_not_exist): ', 'It is OK, the field  exist or is not in the expected condition');
              return done();
            } else {
              if (imp_script.action.mode == 'sql') {
                console.log('INDEX run_setup_scripts(index_not_exist): ', 'Executing run_setup_scripts (index_not_exist): ', imp_script.action.sql);
                connection.query(imp_script.action.sql, [], (err, result) => {
                  done(err, result);
                });
              } else {
                console.log('INDEX run_setup_scripts(index_not_exist): ', 'last imp_script', imp_script);
                throw 'run_setup_scripts (index_not_exist) action is not implemented';
              }
            }
          });
        } else if (imp_script.condition.mode == 'run_script') {
          imp_script.script.run_script(connection, local_log, (err) => {
            done(err);
          });
        } else {
          console.log('run_setup_scripts: ', 'last imp_script', imp_script);
          throw 'run_setup_scripts condition is not implemented';
        }
      },
      (err, allDone) => {
        return cb(err, null);
      }
    );
  },
  validate: (log, app, cb, time_on_failure = 2, requester = 'undefined') => {
    loaded_tables = [];
    var current_db_info = { tables: {}, indexes: {} };
    if (log != false) {
      local_log = log;
    }
    if (time_on_failure > 120) {
      time_on_failure = 120;
    }

    connection.query('select now() as t ', [], function (err, result, fields) {
      time_on_failure = time_on_failure + time_on_failure * 0.25;
      // Checks if MySql is UP
      if (err) {
        debug(err.code);
        if (err.code == 'ER_BAD_DB_ERROR') {
          console.error({ err: err }, 'MYSQL DATABASE NOT EXIST, CREATING IT', config.db.database);
          console.log('MYSQL DATABASE ' + config.db.database + ' DO NOT EXIST, WILL TRY TO CREATE IT.');
          TableValidator.create_database((err) => {
            if (TableValidatorAllowedFixes > 0) {
              TableValidatorAllowedFixes--;
              setTimeout(() => {
                TableValidator.validate(false, app, cb, time_on_failure, 'create_database');
              }, time_on_failure * 1000);
            } else {
              console.log('All tries to create the Database failed. Need an manual action.');
            }
          });
        } else {
          console.error({ err: err }, 'MYSQL SEEMS TO BE DOWN');
          console.log('MYSQL SEEMS TO BE DOWN, will retry in ', err.code, time_on_failure.toFixed(1), ' seconds');
          setTimeout(() => {
            TableValidator.validate(false, app, cb, time_on_failure, 'err:' + err.code);
          }, time_on_failure * 1000);
        }

        return;
      } else {
        // Get  all tables from DB
        connection.query('SHOW TABLES; ', [], function (err, tab_result) {
          var db_tabs = [];
          tab_result.forEach((tab) => {
            var tab_name = tab['Tables_in_' + config.db.database];
            debug('loading', tab_name);
            db_tabs.push(tab_name);
          });

          // For each TAB
          async.mapLimit(
            tabs,
            1,
            (d, map_cb) => {
              // for each tab
              console.log('Validating ', d, ' (requester:', requester, ')');

              // If Tab is not found
              if (db_tabs.indexOf(d) < 0) {
                // Try to create the table
                TableValidator.create_table_structure(d, (err) => {
                  // if(err == null && typeof d != "undefined"){
                  //     loaded_tables.push(d)
                  // }
                  return map_cb(err, null);
                });
              } else {
                // If table is found
                // 1 - get all fields
                connection.query('SHOW FIELDS FROM ' + d, [], function (err, result, fields) {
                  if (err) {
                    console.log({ err });
                    console.log('CAN NOT START DUE TO PROBLEM AT MYSQL. AT SHOW FIELDS FROM ' + d);
                    return map_cb(err, null);
                  }
                  // 2 -  Get all Index
                  connection.query('SHOW INDEX FROM ' + d, [], function (err_idx, result_idx, fields_idx) {
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
                        type = f.Type;
                        if (type.indexOf('(') > 0) {
                          type = type.split('(')[0];
                        }
                        // cols[f.Field] = { type: type }
                      });
                      loaded_tables.push(d);
                      return map_cb(err, null);
                    });
                  });
                });
              }
            },
            (err, done) => {
              console.log('Tables exist validated ', { err, check_loaded: TableValidator.check_loaded(), tabs_length: tabs.length, loaded_tables_length: loaded_tables.length });
              // all done
              if (!err && TableValidator.check_loaded()) {
                console.log('Tables loaded with success.');
                console.log('Now will validate each field.');
                app.page_started = true;
                console.log('Starting validation.');
                TableValidator.validate_tables(current_db_info, (err, result) => {
                  if (err == 'PROBLEMS_FIXED') {
                    return TableValidator.validate(false, app, cb, time_on_failure, 'PROBLEMS_FIXED');
                  } else {
                    // Next will validate if default admin user exist.
                    TableValidator.validate_admin_user((usr_err) => {
                      return cb(err || usr_err);
                    });
                  }
                });
              } else {
                if (TableValidatorAllowedFixes > 0 && TableValidator.check_loaded() == false) {
                  TableValidatorAllowedFixes--;
                  console.log('Found some problems, will try again.');
                  return TableValidator.validate(false, app, cb, time_on_failure, 'TableValidatorAllowedFixes');
                } else {
                  if (err == null) {
                    console.log('CAN NOT START THE APPLICATION, ERR:', err, ' check_loaded:', TableValidator.check_loaded(), ' TableValidatorAllowedFixes:', TableValidatorAllowedFixes);
                  } else {
                    console.log('CAN NOT START THE APPLICATION DUE THE ERROR: ', err);
                  }
                }
              }
            }
          );
        });
      }
    });
  },
  compare_types: (a, b) => {
    if ((a == 'int(11)' && b == 'int') || (b == 'int(11)' && a == 'int')) {
      return false;
    } else if ((a == 'int(11) unsigned' && b == 'int unsigned') || (b == 'int(11) unsigned' && a == 'int unsigned')) {
      return false;
    } else if ((a == 'int(10) unsigned' && b == 'int unsigned') || (b == 'int(10) unsigned' && a == 'int unsigned')) {
      return false;
    } else if ((a == 'int(10)' && b == 'int') || (b == 'int(10)' && a == 'int')) {
      return false;
    } else if ((a == 'smallint(6)' && b == 'smallint') || (b == 'smallint(6)' && a == 'smallint')) {
      return false;
    } else if ((a == 'tinyint(4)' && b == 'tinyint') || (b == 'tinyint(4)' && a == 'tinyint')) {
      return false;
    } else if ((a == 'DEFAULT_GENERATED on update CURRENT_TIMESTAMP' && b == 'on update CURRENT_TIMESTAMP') || (b == 'DEFAULT_GENERATED on update CURRENT_TIMESTAMP' && a == 'on update CURRENT_TIMESTAMP')) {
      return false;
    } else {
      return a != b;
    }
  },
  validate_admin_user: (cb) => {
    //FIXME: Let it more generic.
    connection.query('select count(*) as qty from master_user where user_id = ?', [config.admin_user.username], (err, rows_admin) => {
      if (err) {
        throw err;
      }
      connection.query('select count(*) as qty from master_user where role = ? or role = ? or user_id = ?', ['管理責任者', '保守担当', config.admin_user.username], (err, rows_any_admin) => {
        if (err) {
          throw err;
        }
        if ((rows_admin[0].qty < 1 && config.admin_user.mode == 'admin') || (rows_any_admin[0].qty < 1 && config.admin_user.mode == 'any_admin')) {
          require('../models/master_user').local_add_user(
            {
              password: config.admin_user.default_password,
              user_id: config.admin_user.username,
              role: config.admin_user.role,
              company: config.admin_user.company,
              user_shimei: 'Admin User',
            },
            (err) => {
              if (err == null) {
                console.log('Default user ', config.admin_user.username, ' was created with default password. Please change the password.');
              } else {
                console.log('Can not create the ADMIN user.');
              }
              TableValidatorExecutedFixes++;
              cb(err);
            }
          );
        } else {
          console.log('Admin user validated.');
          cb(null);
        }
      });
    });
  },
  validate_tables: (current_db_info, cb) => {
    console.log('Running tables structure validation.');
    var critical_errors = [];
    var warning_errors = [];
    // debug("current_db_info", current_db_info);

    if (fs.existsSync('./db_info/') == false) {
      fs.mkdirSync('./db_info/');
    }
    // Save the last info, to be used to compare, and also can be moved to version_info
    // fs.writeFileSync('./db_info/last_info.json', JSON.stringify(current_db_info, null, 4), 'utf-8');
    // Check if version info exist, to then compare.
    if (fs.existsSync('./db_info/version_info.json') == true) {
      var version_info = JSON.parse(fs.readFileSync('./db_info/version_info.json', 'utf-8'));

      // For each table in the version_info
      for (var tab in version_info.tables) {
        debug('checking tab', tab);

        // If table do not exist, is just a double check, as it was already validated before
        if (false) {
          console.log('Ignore table ', tab);
        } else if (typeof current_db_info.tables[tab] == 'undefined') {
          critical_errors.push({
            message: 'Table ' + tab + " don't exist. (May need to add to config.js)",
            type: 'table_do_not_exist',
            table: tab,
          });
        } else {
          // For each field.
          var previous_field = null;
          for (var field_name in version_info.tables[tab]) {
            var field = version_info.tables[tab][field_name];
            // Check if the field exists
            if (typeof current_db_info.tables[tab][field_name] == 'undefined') {
              critical_errors.push({
                message: "Field '" + field_name + "' at table '" + tab + "' don't exist.",
                type: 'field_do_not_exist',
                table: tab,
                field: field_name,
                expected: field,
                previous: previous_field,
              });
            } else {
              // for each propriety in the fields.
              for (var prop in field) {
                // Check if the propriety exist.
                if (TableValidator.compare_types(current_db_info.tables[tab][field_name][prop], field[prop])) {
                  warning_errors.push({
                    message: "Property '" + prop + "' of field '" + field_name + "' at table '" + tab + "', with value (" + current_db_info.tables[tab][field_name][prop] + ') is different from expected (' + version_info.tables[tab][field_name][prop] + ') .',
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
      var e = 'ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR';
      var w = 'WARNING WARNING WARNING WARNING WARNING WARNING WARNING WARNING ';
      var l = '-----------------------------------------------------------------';

      if (TableValidatorExecutedFixes > 0 && TableValidatorAllowedFixes > 0) {
        TableValidatorAllowedFixes--;
        console.log('Fixed some problems, will validated again');
        cb('PROBLEMS_FIXED');
      } else {
        var err = null;
        if (critical_errors.length > 0) {
          var msg = 'Critical errors was found. Fix it before from continue!';
          console.log(e);
          console.log(msg);
          critical_errors.forEach((err) => {
            console.log('    ' + l);
            console.log('    ' + err.message);
            console.log('    ' + l);
          });
          console.log(e);
          console.log(msg);
          err = 'CRITICAL ERRORS';
        } else if (warning_errors.length > 0) {
          var msg = 'Errors was found. You can continue but unexpected problems may occur! Try to fix it before from continue.';
          console.log(w);
          console.log(msg);
          warning_errors.forEach((err) => {
            console.log('    ' + l);
            console.log('    ' + err.message);
            console.log('    ' + l);
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
