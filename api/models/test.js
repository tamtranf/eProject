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
      // {

    ];
    const toyota = ['Harrier', 'Corola', 'Camry', 'Avalon', 'Auris', 'Yaris', 'Prius', 'Altis', 'Civic', 'CR-V', 'Hilux', 'Land Cruiser',
      'RAV4', 'Avalon Hybrid', 'Altis Hybrid', 'C-HR', 'Highlander', 'Highlander Hybrid'];
    const honda = ['Accord', 'Civic', 'CR-V', 'Hilux', 'Land Cruiser', 'RAV4', 'Avalon Hybrid', 'Altis Hybrid', 'C-HR', 'Highlander', 'Highlander Hybrid'];
    const nissan = ['Versa', 'Sentra', 'Maxima', 'Altima', 'Pathfinder', 'Frontier', 'Versa Note', 'Sentra Note', 'Maxima Note', 'Altima Note', 'Pathfinder Note', 'Frontier Note'];
    const mazda = ['CX-3', 'CX-5', 'CX-7', 'CX-9', 'Mazda3', 'Mazda5', 'Mazda6', 'MazdaCX-7', 'MazdaCX-9', 'MazdaCX-30'];
    const mitsubishi = ['Lancer', 'Lancer Evolution', 'Outlander', 'Lancer EVO', 'Lancer Sportback', 'Lancer EVO II', 'Lancer EVO XJ'];

    let seq = 100;
    toyota.forEach((car) => {
      list.push({
        id: seq += 1, name: car, group: 'Toyota', code: 'TOY',
      });
    });
    seq = 200;
    honda.forEach((car) => {
      list.push({
        id: seq += 1, name: car, group: 'Honda', code: 'HON',
      });
    });
    seq = 300;
    nissan.forEach((car) => {
      list.push({
        id: seq += 1, name: car, group: 'Nissan', code: 'NIS',
      });
    });
    seq = 400;
    mazda.forEach((car) => {
      list.push({
        id: seq += 1, name: car, group: 'Mazda', code: 'MAZ',
      });
    });
    seq = 500;
    mitsubishi.forEach((car) => {
      list.push({
        id: seq += 1, name: car, group: 'Mitsubishi', code: 'MIT',
      });
    });

    list.forEach((l) => {
      l.id = l.name;
      l.key = md5(l.id);
      l.key2 = md5(l.id * l.id);
      l.name = `${l.name}`;
    });

    // const async = require('async');
    // const moment = require('moment');
    // async.mapLimit(list, 1, (_item, done) => {
    //   const rand = function (min, max) {
    //     return Math.floor(Math.random() * (max - min + 1)) + min;
    //   };
    //   const names = ['John', 'Peter', 'Sally', 'Jane', 'Jack', 'Paul', 'Mark', 'Samantha', 'Emily', 'Kate', 'Emily', 'Kate', 'Jack', 'Paul', 'Mark', 'Samantha', 'Jane', 'Sally', 'Peter', 'John'];
    //   const surnames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
    //     'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson'];

    //   const name = `${names[rand(0, names.length - 1)]} ${surnames[rand(0, surnames.length - 1)]}`;
    //   const sql = 'INSERT INTO master_template (`user_name`, `maker`, `car`, `user_password`, `retrieve_date_time`, `return_date`)VALUES(?,?,?,?,?,?)';
    //   const params = [name, _item.group, _item.name, rand(10000000, 90000000), moment().subtract(rand(2000, 200000), 'minutes').format('YYYY/MM/DD HH:mm:ss'),
    //     moment().add(rand(10000, 200000), 'minutes').format('YYYY/MM/DD')];
    //   DataUtils.query(sql, params, {}, (err) => {
    //     done(err);
    //   });
    // }, (_err, _allDone) => {
    //   ResponseUtils.response(req, res, { list });
    // });
    ResponseUtils.response(req, res, { list });
  }
}

module.exports = new TestModel();
