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
    database: 'e_db_1',
    dateStrings: true,
  },
  auto_create_database: true,
  auto_create_tables: true,
  auto_create_and_change_fields: true,
  tables: [
    'master_dev',
    'master_test',
    'master_template',
  ],
  admin_user: {
    username: 'admin',
    default_password: 'iss201907', // This password should be updated, it will be used only when created.
    mode: 'admin', // 'admin' then the 'admin' user is required with {admin_user.username}, or 'any_admin' with any name is required.
    role: '保守担当',
    company: 'MHTB',
  },
  bunyan_logger: {
    name: 'esma',
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

module.exports = config;
