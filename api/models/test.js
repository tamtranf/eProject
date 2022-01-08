const os = require('os');
const fs = require('fs');
const path = require('path');
const DataUtils = require('../libs/data_utils');
const ResponseUtils = require('../libs/response_utils');
const BaseModel = require('../libs/base_model');
const constants = require('../rules/constants');
const debug = require('../libs/debug').create('TestModel');

class TestModel extends BaseModel {
  constructor() {
    super();
    debug('Started');
    this.id = 'test';
    this.table = 'master_test';
    this.form_fields = 'test_field, seq_id';
    this.routes = {
      test: {
        method: 'get', func: 'test_func', path: '/', no_login: true,
      },
      test_access: {
        method: 'get', func: 'test_access', path: '/access', no_login: true,
      },
      test_disk: {
        method: 'get', func: 'test_disk', path: '/disk', no_login: true,
      },
      test_db: {
        method: 'get', func: 'test_db', path: '/db', no_login: true,
      },
    };
  }

  get_fields() {
    return [];
  }

  test_func(req, res) {
    ResponseUtils.response(req, res, { test: 123, constants }, null);
  }

  test_access(req, res) {
    let server_info = 'Server Info:<br>';
    server_info += `platform: ${os.platform()}<br>`;
    server_info += `release: ${os.release()}<br>`;
    server_info += `version: ${os.version()}<br>`;
    server_info += `cpus: ${os.cpus()[0].model}<br>`;
    server_info += `cpus(threads): ${os.cpus().length}<br>`;
    server_info += `totalmem: ${os.totalmem() / 1024 / 1024}<br>`;
    server_info += `arch: ${os.arch()}<br>`;
    server_info += `Node: ${process.version}<br>`;
    server_info += `Path: ${__dirname}<br>`;

    ResponseUtils.response(req, res, { code: 123, server_info }, null);
  }

  test_disk(req, res) {
    const base_path = path.join(__dirname, '../', 'temp');
    const file_path = path.join(base_path, 'test_file.txt');
    if (fs.existsSync(base_path) === false) {
      fs.mkdirSync(base_path, { recursive: true });
    }
    const time = `${new Date().getTime()}`;
    fs.writeFile(file_path, time, (err) => {
      if (err) {
        ResponseUtils.response(req, res, {}, err);
      }
      fs.readFile(file_path, 'utf8', (err2, loaded_data) => {
        if (err2) {
          return ResponseUtils.response(req, res, {}, err2);
        }
        if (loaded_data === time) {
          ResponseUtils.response(req, res, { time }, null);
        }
      });
    });
  }

  test_db(req, res) {
    const time = `${new Date().getTime()}_str`;
    const time_int = new Date().getSeconds();
    DataUtils.query('INSERT INTO master_test (test_field,test_number)VALUES(?,?)', [time, time_int], {}, (err) => {
      if (err) {
        console.log('ERROR at insert', { err });
        return ResponseUtils.response(req, res, {}, err);
      }
      DataUtils.query('SELECT * FROM master_test order by seq_id  desc limit 0,1', [], {}, (err2, data) => {
        if (err2) {
          console.log('ERROR at SELECT', { err2 });
          return ResponseUtils.response(req, res, {}, err2);
        }
        ResponseUtils.response(req, res, { data: data[0] });
      });
    });
  }
}

module.exports = new TestModel();
