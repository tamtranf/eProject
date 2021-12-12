const config = require('../config/default');
const mysql = require('mysql');
const _ = require('lodash');
const uuid = require('uuid');
const debug = require('./debug').create('DataUtils');
const debugPool = require('./debug').create('DataUtilsPool');
const ResponseUtil = require('./response_utils');

class DataUtils {
  constructor() {
    debug('Starting');
    this.debug_query = true;
    this.connection = mysql.createPool(config.db);
    this.connection_for_transaction = mysql.createPool(config.db);
    var in_use_connection_for_transaction = 0;
    // var in_use_connection = 0;
    // this.connection.on('acquire', function (connection) {
    //   debugPool((new Date()).getTime() + ' POOL_CONTROL: Connection '+connection.threadId+' acquired', in_use_connection);
    //   in_use_connection = in_use_connection + 1;
    // });
    // this.connection.on('release', function (connection) {
    //   in_use_connection = in_use_connection - 1;
    //   debugPool((new Date()).getTime() + ' POOL_CONTROL: Connection',connection.threadId,' released, total_in_use:' , in_use_connection);
    // });
    // this.open_queries = {}
    // setInterval(() => {
    //   if(Object.keys(this.open_queries).length > 0){
    //     debugPool((new Date()).getTime() + ' POOL_CONTROL: this.open_queries ', this.open_queries);
    //   }
    // }, 5000);
    this.connection_for_transaction.on('acquire', function (connection) {
      debugPool((new Date()).getTime() + ' POOL_CONTROL: Connection for transaction '+connection.threadId+' acquired', in_use_connection_for_transaction);
      in_use_connection_for_transaction = in_use_connection_for_transaction + 1;
    });
    this.connection_for_transaction.on('release', function (connection) {
      in_use_connection_for_transaction = in_use_connection_for_transaction - 1;
      debugPool((new Date()).getTime() + ' POOL_CONTROL: Connection for transaction ',connection.threadId,' released, total_in_use:' , in_use_connection_for_transaction);
    });
    setInterval(() => {
      if(in_use_connection_for_transaction > 0){
        debugPool((new Date()).getTime() + ' POOL_CONTROL: in_use_connection_for_transaction ', in_use_connection_for_transaction );
      }
      if(in_use_connection_for_transaction > 1){
        console.log((new Date()).getTime() + ' POOL_CONTROL: in_use_connection_for_transaction ', in_use_connection_for_transaction );
      }
    }, 5000);

  }
  get_connection(requester, cb){
    this.connection_for_transaction.getConnection((err, connection) =>{
      console.log((new Date()).getTime() + 'POOL_CONTROL:  getConnection:',{requester},  connection.threadId);
      if (err){
        return cb(err)
      }else{
        return cb(null,connection)
      }
    })
  }
  begin_transaction(connection,cb){
    connection.beginTransaction((err) =>{
      if (err) {
        connection.release();
        return cb(err)
      }else{
        return cb(null)
      }
    })
  }
  /**
   * Do both get_connection  and begin_transaction at once.
   * @param {*} cb 
   */
  get_new_transaction_connection(requester, cb){
    this.get_connection(requester, (err, _connection) =>{
      if (err){
        try {
          _connection.release()
        } catch (error) {
          console.log("ERROR TO RELEASE CONNECTION",error)
        }
        return cb("接続に失敗しました。");
      }else{
        this.begin_transaction(_connection,(err)=>{
          if (err) {
            try {
              _connection.release()
            } catch (error) {
              console.log("ERROR TO RELEASE CONNECTION AT TRANSACTION",error)
            }
            return cb("トランザクションの開始に失敗しました。");
          }else{
            cb(err,_connection)
          }
        })
      }
    })
  }
  /**
   * Check the error and decide for commit or rollback then return
   * @param {*} req 
   * @param {*} res 
   * @param {*} error An error or a null, to be tested, if true will do the rollback and return it as an error
   * @param {*} connection 
   */
  transaction_commit_and_return(req,res,error,connection){
    if(error){
      this.transaction_rollback_and_release(connection,(err2)=>{
        return ResponseUtil.response(req,res,[], err2 || error);
      })
    }else{
      this.transaction_commit_or_rollback(connection,(err3)=>{
        return ResponseUtil.response(req,res,[], err3);
      })
    }
  }
  transaction_commit_or_rollback(connection,cb){
    connection.commit((err) =>{
      if (err) {
        this.transaction_rollback_and_release(connection,cb)
      }else{
        connection.release();
        return cb(null);
      }
    });
  }
  transaction_rollback_and_release(connection,cb){
    return connection.rollback((err) =>{
      connection.release();
      return cb(err);
    });
  }
  query(sql, params, options, callback) {
    var query_id = uuid.v4();
    if(options==false){
      options = {}
    }
    options.show_query = true;
    
    var local_connection  = false;
    if(options && options.connection && options.connection != false){
      local_connection = options.connection;
    }else{
      local_connection = this.connection;
    }
    var start = (new Date()).getTime();
    local_connection.query(sql, params, (err, result, fields) => {
      if (err) {
        console.trace('QUERY ERROR:', { err });
      }
      var end = (new Date()).getTime();
      if (this.debug_query && options.show_query == true && end - start > 0 )  {
        debug("query result:", {time: end -start, len:(Array.isArray(result))?result.length:"-"},this.print_query({ sql, params  }));
      }else if(true){
        debug("(log all)query result:", {time: end -start, len:(Array.isArray(result))?result.length:"-"},this.print_query({ sql, params  }));
      }
      callback(err, result, fields);
    });
  }
  query_one(sql, params, options, callback) {
    var query_id = uuid.v4();
    if(options==false){
      options = {}
    }
    options.show_query = true;
    if (typeof options == 'undefined') {
      options = {};
    }
    if (typeof options.def == 'undefined') {
      options.def = false;
    }
    var local_connection  = false;
    if(options && options.connection && options.connection != false){
      local_connection = options.connection;
    }else{
      local_connection = this.connection;
    }
    if (this.debug_query || options.show_query) {
      debug("query one start:", {query_id},this.print_query({  sql, params  }));
    }
    local_connection.query(sql, params, (err, data) => {
      if (data && data.length > 0) {
        callback(err, data[0]);
      } else {
        callback(err, options.def);
      }
    });
  }
  print_query({ sql, params, options = {} }) {
    var temp = _.clone(sql);
    if (params && Array.isArray(params) && params.length > 0) {
      params.forEach((e) => {
        temp = temp.replace('?', " '" + e + "' ");
      });
    }
    return temp;
  }
  parse_obj_to_update ( obj, update_tab, fields )  {
    debug("parse_obj_to_update start", {obj,update_tab, fields})
    var query = "UPDATE " + update_tab + " SET ";
    var data = []
    var comma = ""
    for (var key in obj) {
        if (obj[key] == null) {
            query += comma + "`" + key + "`=NULL"
        } else {
            query += comma + "`" + key + "`=?"
            if (typeof fields[key] != "undefined" && fields[key].type.indexOf("date") > -1) {
                var date_obj = new Date(obj[key])
                data.push(date_obj)
            } else {
                data.push(obj[key])
            }
        }
        comma = ", "
    }
    debug("parse_obj_to_update return", { query, data })
    return { sql:query, params:data };
  }
}

module.exports = new DataUtils();
