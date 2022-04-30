const express = require('express');
const Nseq = require('nseq');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bunyan = require('bunyan');
const fileUpload = require('express-fileupload');
const RouteUtil = require('./libs/route_utils');
const config = require('./config/default');
const table_validator = require('./libs/table_validator');

const log = bunyan.createLogger(config.bunyan_logger);

log.info('Starting APP');

Object.keys(config.env).forEach((c) => {
  process.env[c] = config.env[c];
});

const app = express();
app.use(fileUpload({}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, _res, next) => {
  req.log = log.child({ req_id: uuid.v4() });
  next();
});

const models = fs.readdirSync(path.join(__dirname, 'models')).filter((f) => f.indexOf('base_') !== 0).map((m) => require(`./models/${m}`));

// Register the models routes (without login)
RouteUtil.set(app, models, false);

// FIXME: Do the login here.

// Register the models routes (with login)
RouteUtil.set(app, models, true);
new Nseq().do([
  (self) => {
    self.next();
  },
  (self) => {
    table_validator.validate(false, app, (err) => {
      console.log('Table pre-validations done!');
      if (err) {
        // In case of error, continue.
        console.log('ERROR:', err);
      }
      self.next();
    }, 2, 'app.pre_open');
  },
  (self) => {
    table_validator.run_setup_scripts((err) => {
      if (err) {
        console.log('Error to create the setup_scripts', err);
      } else {
        console.log('The setup_scripts was executed!');
      }
      self.next();
    });
  },
  (self) => {
    self.next();
  },
]);

if (process.version !== 'v16.13.0') {
  setInterval(() => { console.log('Unexpected node version:', process.version, ' Expected is v16.13.0.\nTo fix it run: \nnvm use v16.13.0 '); }, 1000);
} else {
  console.log('Confirmed version:', process.version);
}

module.exports = app;
