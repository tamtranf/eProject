const config = require('./config/default');
Object.keys(config.env).forEach((c) => {
  process.env[c] = config.env[c];
});
var express = require('express');
var nseq = require('nseq');
var path = require('path');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var RouteUtil = require('./libs/route_utils');
const table_validator = require('./libs/table_validator.js');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var models = fs
  .readdirSync(path.join(__dirname, 'models'))
  .filter((f) => f.indexOf('base_') != 0)
  .map((m) => require('./models/' + m));

// Register the models routes (without login)
RouteUtil.set(app, models, false);

//FIXME: Do the login here.

// Register the models routes (with login)
RouteUtil.set(app, models, true);
new nseq().do([
  (self) => {
    self.next();
  },
  (self) => {
    table_validator.validate( false, app, (err) => {
        console.log('Table pre-validations done!');
        if (err) {
          // In case of error, continue.
          console.log('ERROR:', err);
        }
        self.next();
      }, 2, 'app.pre_open'
    );
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

if (process.version != 'v16.13.0') {
  console.log('Unexpected node version:', process.version);
}

module.exports = app;
