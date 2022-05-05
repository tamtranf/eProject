// const debug = require('./debug').create('ResponseUtils');

class ResponseUtils {
  // constructor() {}
  response(req, res, data, error, options = {}, cb = false) {
    if (error != null && req && req.log && req.log.info) {
      req.log.warning({ error }, 'Return error.');
    }
    if (cb !== false) {
      return cb(error, data);
    }
    if (options.error_code) {
      return res.json({
        success: error == null, data, error, error_code: options.error_code,
      });
    }
    return res.json({ success: error == null, data, error });
  }
}

module.exports = new ResponseUtils();
