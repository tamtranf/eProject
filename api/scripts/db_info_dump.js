const fs = require('fs');
const path = require('path');
const mysql = require('mysql');
const config = require('../config/default');
const async = require('async');
const _ = require('lodash');
var bunyan = require('bunyan');

var debug = require('debug')('e:table_validator');
const commandLineArgs = require('command-line-args')
var log = bunyan.createLogger(config.bunyan_logger);
var mysqlDump = require('mysqldump');
var connection = mysql.createPool(config.db);

var loaded_tables = [];

var local_log = false;

const cli = commandLineArgs([{ name: 'tables', type: String, multiple: true, defaultValue: "*" }])

// var tabs = config.tables;
var tabs = _.filter(config.tables,(f)=>{
  return cli.tables.indexOf("*") == 0 || cli.tables.indexOf(f)==0
});

var TableValidator = {
  dump_recreate_indexes: (tab_name, cb) => {
    var buff = '';
    var file_name = './db_info/version_tables/idx_' + tab_name + '.sql';
    // DROP Auto increment.
    var s1 = "SELECT CONCAT( 'ALTER TABLE `', TABLE_NAME, '` ', 'MODIFY COLUMN `', COLUMN_NAME, '` ', IF(UPPER(DATA_TYPE) = 'INT', REPLACE( SUBSTRING_INDEX( UPPER(COLUMN_TYPE), ')', 1 ), 'INT', 'INTEGER' ), UPPER(COLUMN_TYPE) ), ') UNSIGNED NOT NULL;' ) AS 'row' FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND EXTRA = UPPER('AUTO_INCREMENT') ORDER BY TABLE_NAME ASC;";
    // DROP Indexes
    var s2 = "SELECT CONCAT( 'ALTER TABLE `', TABLE_NAME, '` ', GROUP_CONCAT( DISTINCT CONCAT( 'DROP ', IF(UPPER(INDEX_NAME) = 'PRIMARY', 'PRIMARY KEY', CONCAT('INDEX `', INDEX_NAME, '`') ) ) SEPARATOR ', ' ), ';' ) AS 'row' FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? GROUP BY TABLE_NAME ORDER BY TABLE_NAME ASC ";

    // Indexes
    var s3 = "SELECT CONCAT( 'ALTER TABLE `', TABLE_NAME, '` ', 'ADD ', IF(NON_UNIQUE = 1, CASE UPPER(INDEX_TYPE) WHEN 'FULLTEXT' THEN 'FULLTEXT INDEX' WHEN 'SPATIAL' THEN 'SPATIAL INDEX' ELSE CONCAT('INDEX `', INDEX_NAME, '` USING ', INDEX_TYPE ) END, IF(UPPER(INDEX_NAME) = 'PRIMARY', CONCAT('PRIMARY KEY USING ', INDEX_TYPE ), CONCAT('UNIQUE INDEX `', INDEX_NAME, '` USING ', INDEX_TYPE ) ) ), '(', GROUP_CONCAT( DISTINCT CONCAT('`', COLUMN_NAME, '`') ORDER BY SEQ_IN_INDEX ASC SEPARATOR ', ' ), ');' ) AS 'row' FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ?  AND TABLE_NAME = ? GROUP BY TABLE_NAME, INDEX_NAME,NON_UNIQUE,INDEX_NAME,INDEX_TYPE,INDEX_NAME ORDER BY TABLE_NAME ASC, INDEX_NAME ASC ";

    // Auto increment.
    var s4 = "SELECT CONCAT( 'ALTER TABLE `', TABLE_NAME, '` ', 'MODIFY COLUMN `', COLUMN_NAME, '` ', IF(UPPER(DATA_TYPE) = 'INT', REPLACE( SUBSTRING_INDEX( UPPER(COLUMN_TYPE), ')', 1 ), 'INT', 'INTEGER' ), UPPER(COLUMN_TYPE) ), ') UNSIGNED NOT NULL AUTO_INCREMENT;' ) AS 'row' FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND EXTRA = UPPER('AUTO_INCREMENT') ORDER BY TABLE_NAME ASC ";

    connection.query(s1, [config.db.database, tab_name], function (err1, r1, fields) {
      connection.query(s2, [config.db.database, tab_name], function (err2, r2, fields) {
        connection.query(s3, [config.db.database, tab_name], function (err3, r3, fields) {
          connection.query(s4, [config.db.database, tab_name], function (err4, r4, fields) {
            if (err3 != null) {
              console.log('err3', err3);
            }
            r3.forEach((r) => {
              buff += r['row'] + '\n';
            });
            if (err4 != null) {
              console.log('err4', err4);
            }
            r4.forEach((r) => {
              buff += r['row'] + '\n';
            });
            // console.log(buff);
            fs.writeFileSync(file_name, buff, 'utf8');
            cb(err3 || err4);
          });
        });
      });
    });
  },
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

  dump_structure: (tab_name, cb) => {
    // dump_structure_time = dump_structure_time + 3000;
    // setTimeout(() => {
    if (fs.existsSync('./db_info/version_tables/') == false) {
      fs.mkdirSync('./db_info/version_tables/');
    }

    var dump_obj_connection = {
      connection: {
        host: config.db.host,
        user: config.db.user,
        password: config.db.password,
        database: config.db.database,
      },
      engine: true,
      dump: {
        tables: [tab_name],
        data: false,
        schema: {
          autoIncrement: false,
        },
        trigger: false,
      },
      dumpToFile: './db_info/version_tables/table_' + tab_name + '.sql',
    };

    (async () => {
      try {
        const result = await mysqlDump(dump_obj_connection);

        var table_str = fs.readFileSync( "./db_info/version_tables/table_" + tab_name + ".sql","utf-8");
              var remove_arr = [" CHARACTER SET utf8mb4"," COLLATE utf8mb4_general_ci"," COLLATE utf8_general_ci"," CHARACTER SET utf8","COLLATE utf8mb4_general_ci"]
              table_str = table_str.split("\n").map(m =>{
                if(m.toUpperCase().indexOf("ENGINE") > -1){ return m; }
                else{ var t =  m; remove_arr.forEach(e=>{ t = t.replace(e,"").replace(e,""); }); return t; }
               }).join("\n")
               fs.writeFileSync( "./db_info/version_tables/table_" + tab_name + ".sql",table_str);

        return TableValidator.dump_recreate_indexes(tab_name, cb);
      } catch (error) {
        console.log('Error to create table dump  ', { error, tab_name });
      }
    })();
  },

  validate: (log_, app, cb, time_on_failure = 2, requester = 'undefined') => {
    loaded_tables = [];
    var current_db_info = { tables: {}, indexes: {} };
    if(fs.existsSync('./db_info/version_info.json')){
      current_db_info = JSON.parse(fs.readFileSync('./db_info/version_info.json', 'utf-8'));
      if(typeof current_db_info.tables == "undefined"){
        current_db_info.tables = {}
      }
      if(typeof current_db_info.indexes == "undefined"){
        current_db_info.indexes = {}
      }
    }

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
          console.log({ err });
          throw 'Database do not exist, can not dump.';
        } else {
          console.log({ err });
          throw 'ERROR, can not continue.';
        }
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
                throw "Desired table '" + d + "' to not exist, can not continue.";
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
              fs.writeFileSync('./db_info/version_info.json', JSON.stringify(current_db_info, null, 4), 'utf-8');
              return cb(err);
            }
          );
        });
      }
    });
  },
};

TableValidator.validate(null, null, (err, result) => {
  console.log('RESULT', { err, result });
  if (err == null) {
    console.log('Files created with success');
  }
  process.exit(err == null ? 0 : 1);
});
