const os = require('os');
const fs = require('fs');
const md5 = require('md5');
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
      get_options: {
        method: 'post', func: 'get_options', path: '/get_options', no_login: true,
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

  get_options(req, res) {
    // this is a sample list of options, for test usage, it will not collect it from the DB, but local
    const list = [
      {
        id: 100 + 1, name: 'Microsoft', group: 'opt1', code: 'MS',
      },
      {
        id: 100 + 2, name: 'IBM', group: 'opt1', code: 'IBM',
      },
      {
        id: 100 + 3, name: 'Oracle', group: 'opt1', code: 'O',
      },
      {
        id: 100 + 4, name: 'SAP', group: 'opt1', code: '',
      },
      {
        id: 100 + 5, name: 'Tata Consultancy Services', group: 'opt1', code: 'TCS',
      },
      {
        id: 100 + 6, name: 'PayPal', group: 'opt1', code: 'PP',
      },
      {
        id: 100 + 7, name: 'Salesforce', group: 'opt1', code: 'SF',
      },
      {
        id: 100 + 8, name: 'Fiserv', group: 'opt1', code: 'F',
      },
      {
        id: 100 + 9, name: 'ADP', group: 'opt1', code: 'ADP',
      },
      {
        id: 100 + 10, name: 'Adobe', group: 'opt1', code: 'ADB',
      },
      {
        id: 200 + 11, name: 'Infosys', group: 'opt2', code: 'I',
      },
      {
        id: 200 + 12, name: 'VMware', group: 'opt2', code: 'VW',
      },
      {
        id: 200 + 13, name: 'Global Payments Inc', group: 'opt2', code: 'GPI',
      },
      {
        id: 200 + 14, name: 'Intuit', group: 'opt2', code: 'IT',
      },
      {
        id: 200 + 15, name: 'SS&C Technologies', group: 'opt2', code: 'SSC',
      },
      {
        id: 200 + 16, name: 'NetApp', group: 'opt2', code: 'NA',
      },
      {
        id: 200 + 17, name: 'ServiceNow', group: 'opt2', code: 'SN',
      },
      {
        id: 200 + 18, name: 'Workday', group: 'opt2', code: 'WD',
      },
      {
        id: 200 + 19, name: 'Broadridge Financial Solutions', group: 'opt2', code: 'BFS',
      },
      {
        id: 200 + 20, name: 'Palo Alto Networks ', group: 'opt2', code: 'PAN',
      },
      {
        id: 300 + 21, name: 'Paychex', group: 'opt3', code: 'PC',
      },
      {
        id: 300 + 22, name: 'NortonLifeLock', group: 'opt3', code: 'MLL',
      },
      {
        id: 300 + 23, name: 'Amdocs', group: 'opt3', code: 'ADS',
      },
      {
        id: 300 + 24, name: 'Autodesk', group: 'opt3', code: 'ADK',
      },
      {
        id: 300 + 25, name: 'Synopsys', group: 'opt3', code: 'SYN',
      },
      {
        id: 300 + 26, name: 'Akamai Technologies ', group: 'opt3', code: 'AT',
      },
      {
        id: 300 + 27, name: 'Citrix Systems', group: 'opt3', code: 'CS',
      },
      {
        id: 300 + 28, name: 'Zoom Video Communications', group: 'opt3', code: 'ZVC',
      },
      {
        id: 300 + 29, name: 'Cadence Design Systems ', group: 'opt3', code: 'CDS',
      },
      {
        id: 300 + 30, name: 'Epam systems', group: 'opt3', code: 'ES',
      },
      {
        id: 400 + 31, name: 'Splunk', group: 'opt4', code: 'SPL',
      },
      {
        id: 400 + 32, name: 'Ansys ', group: 'opt4', code: 'AS',
      },
      {
        id: 400 + 33, name: 'Twilio', group: 'opt4', code: 'TWL',
      },
      {
        id: 400 + 34, name: 'Veeva Systems', group: 'opt4', code: 'VS',
      },
      {
        id: 400 + 35, name: 'DocuSign', group: 'opt4', code: 'DS',
      },
      {
        id: 400 + 36, name: 'RingCentral ', group: 'opt4', code: 'RC',
      },
      {
        id: 400 + 37, name: 'Palantir Technologies ', group: 'opt4', code: 'PT',
      },
    ];
    list.forEach((l) => {
      l.key = md5(l.id);
      l.key2 = md5(l.id * l.id);
      l.name = `${l.id} ${l.name}`;
    });
    ResponseUtils.response(req, res, { list });
  }
}

module.exports = new TestModel();
