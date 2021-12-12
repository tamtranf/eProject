const config = require('../config/default');
const debug = require('./debug').create('RouteUtil');

class RouteUtil {
  constructor() {
    debug('Starting RouteUtil');
  }
  set(app, models, with_login) {
    models.forEach((model) => {
      if(typeof model != "object" ){
        console.log({model})
        throw "Model is not an object"
      }
      if(typeof model.routes != "object"){
        console.log({model})
        throw "Route is not an object"
      }
      var routes = model.routes;
      var id = model.id;
      Object.keys(routes).forEach((k) => {
        var r = routes[k];
        if ((with_login == true && (r.no_login == false || typeof r.no_login == 'undefined')) || (with_login == false && r.no_login == true)) {
          var app_path = '/api/' + id;
          if (typeof r.path != 'undefined') {
            app_path += r.path;
          } else {
            app_path += '/' + k;
          }
          if(with_login){
            debug('Routing Set ',  app_path );
          }else{
            debug('Routing Set (no login)',  app_path );
          }
          if (typeof r.func == 'undefined') {
            r.func = k;
          }
          if (r.method == 'get') {
            app.get(app_path, (req, res) => {
              model[r.func](req, res);
            });
          } else {
            app.post(app_path, (req, res) => {
              model[r.func](req, res);
            });
          }
        }
      });
    });
  }
}

module.exports = new RouteUtil();
