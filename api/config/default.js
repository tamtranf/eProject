const fs = require('fs');
const path = require('path');

const worker_id = process.env.pm_id || '1';
const config = {
  port: 4001,
  env: {
    DEBUG: 'e:*',
    DEBUG_COLORS: true,
  },
  debug: {
    prefix: 'e',
    flags: {
      AppErr: true,
      App: true,
      LoginModel: false,
      RouteUtil: true,
    },
  },
  db: {
    connectionLimit: 30,
    host: '127.0.0.1',
    user: 'e_user',
    password: 'e_Str0n6-p4s5w0Rd',
    database: 'tranvantamver2',
    dateStrings: true,
  },
  auto_create_database: true,
  auto_create_tables: true,
  auto_create_and_change_fields: true,
  tables: [
    'master_dev',
    'master_test',
    'master_template',
    'master_products',
    'master_user',
    'master_entity',
    'master_user_permission',
    'car',
    'rent_history',

  ],
  admin_user: {
    username: 'admin',
    default_password: '1234',
    default_entity: 'personal',
    default_acl_role: 'ADMIN',
    mode: 'admin',
    role: '保守担当',
    company: 'MHTB',
  },
  bunyan_logger: {
    name: 'e',
    src: true,
    streams: [{
      type: 'rotating-file',
      path: `logs/sma_app_${worker_id}.log`,
      period: '1h', // 1h is 1 hour, 1d is 1 day
      count: 7 * 24, // keep 7 days back copies
      level: 'info', // trace, debug, info, warn, error,fatal
    }],
  },
};
if (fs.existsSync(path.join(__dirname, 'aws_config_file.json'))) {
  const aws_config_file = require(path.join(__dirname, 'aws_config_file.json'));
  Object.assign(config, aws_config_file);
  console.log('USING aws_config_file');
}

module.exports = config;
