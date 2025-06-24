const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const debug = require('debug')('esma:FileUtils');
const config = require('../config/default');

const s3 = new AWS.S3();

class FileUtils {
  // constructor() {}

  put_object(file_path, data_to_save, cb = () => {}) {
    if (config.upload_storage.mode === 's3') {
      const bucket_info = config.upload_storage.bucket;
      let key_path = bucket_info.prefix + file_path;
      key_path = key_path.replace(/\/\//g, '/').replace(/\/\//g, '/');
      // Files will be saved at S3.
      const params = {
        Body: data_to_save,
        Bucket: bucket_info.name,
        Key: key_path,
        //  StorageClass: STANDARD | REDUCED_REDUNDANCY | STANDARD_IA | ONEZONE_IA | INTELLIGENT_TIERING | GLACIER | DEEP_ARCHIVE | OUTPOSTS,
        StorageClass: 'STANDARD_IA',
      };
      s3.putObject(params, (err, result) => {
        if (err) {
          debug('an error occurred:', err, err.stack);
        } else {
          debug('success: ', result);
        }
        return cb(err, result);
      });
    } else {
      // Local emulation to save files.
      const save_dir = path.join(config.upload_storage.local.path, file_path);

      if (fs.existsSync(path.dirname(save_dir)) === false) {
        fs.mkdirSync(path.dirname(save_dir), { recursive: true });
      }
      fs.writeFile(save_dir, data_to_save, (err, result) => cb(err, result));
    }
  }

  get_object(file_path, cb = () => {}) {
    if (config.upload_storage.mode === 's3') {
      const bucket_info = config.upload_storage.bucket;
      let key_path = bucket_info.prefix + file_path;
      key_path = key_path.replace(/\/\//g, '/').replace(/\/\//g, '/');
      const params = {
        Bucket: bucket_info.name,
        Key: key_path,
      };
      s3.getObject(params, (err, data) => {
        if (err) {
          debug('an error occurred:', err, err.stack);
        } else {
          debug('success: ', data);
        }
        cb(err, data);
      });
    } else {
      const load_dir = path.join(config.upload_storage.local.path, file_path);
      fs.readFile(load_dir, (err, buff) => {
        if (err) {
          return cb(err, { is_local_file: true });
        }
        return cb(err, { is_local_file: true, Body: buff });
      });
    }
  }

  delete_object(file_path, cb = () => {}) {
    if (config.upload_storage.mode === 's3') {
      const bucket_info = config.upload_storage.bucket;
      let key_path = bucket_info.prefix + file_path;
      key_path = key_path.replace(/\/\//g, '/').replace(/\/\//g, '/');
      const params = {
        Bucket: bucket_info.name,
        Key: key_path,
      };
      s3.deleteObject(params, (err, data) => {
        if (err) {
          debug('an error occurred:', err, err.stack);
        } else {
          debug('success: ', data);
        }
        cb(err, data);
      });
    } else {
      const load_dir = path.join(config.upload_storage.local.path, file_path);
      fs.unlink(load_dir, (err, result) => cb(err, { is_local_file: true, result }));
    }
  }
}

module.exports = new FileUtils();
