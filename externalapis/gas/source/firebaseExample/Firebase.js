/**
 * firebase API
 * @constructor
 */
var Firebase = function () {

  var self = this, token_, root_;
  
  /**
   * set a token
   * @param {object} data the auth data
   * @param {string} secret the secret
   * @return {Firebase} self
   */
  self.setToken = function (data, secret) {
    token_ = FirebaseAuth.generateJWT (data, secret);
    return self;
  };
  
  /**
   * set a database
   * @param {string} root the database url
   * @return {Firebase} self
   */
  self.setRoot = function (root) {
    root_ = root;
    return self;
  };
  
  /**
   * do a put (replaces data)
   * @param {string} putObject an object to put
   * @param {string} [childPath=''] a child path 
   * @return 
   */
  self.put = function (putObject,childPath) {
  
    return payload_ ("PUT", putObject, childPath);
    
  };
  
  /**
   * do a delete
   * @param {string} [childPath=''] a child path 
   * @return 
   */
  self.remove = function (childPath) {
  
    return fetch_ ( getPath_ (childPath), {method:"DELETE"}); 
    
  };
  
  /**
   * do a get
   * @param {string} [childPath=''] a child path 
   * @return 
   */
  self.get = function (childPath) {
  
    return fetch_ ( getPath_ (childPath) ); 
    
  };
  
  /**
   * do a post (adds to data and generates a unique key)
   * @param {string} putObject an object to put
   * @param {string} [childPath=''] a child path 
   * @return 
   */
  self.post = function (putObject,childPath) {
  
    return payload_ ("POST", putObject, childPath);
    
  };
  
  /**
   * do a patch (partially replaces an item)
   * @param {string} putObject an object to put
   * @param {string} [childPath=''] a child path 
   * @return 
   */
  self.patch = function (putObject,childPath) {

    return payload_ ("PATCH", putObject, childPath);
    
  };
  
  /**
   * get the path given a child path
   * @param {string} [childPath=''] the childpath
   * @return {string} the path
   */
  function getPath_  (childPath) {
    return root_ + ( childPath || '' ) + '.json';
  }

  /**
   * do any payload methods
   * @param {string} putObject an object to put
   * @param {string} [childPath=''] a child path 
   * @return 
   */
  function payload_ (method, putObject,childPath) {
    
     return fetch_ ( getPath_ (childPath), {
      method:method,
      payload:JSON.stringify(putObject)
     }); 
  
  }
  
  /**
   * do a fetch
   * @param {string} url the url
   * @param {object} [options={method:'GET'}] 
   * @return
   */
  function fetch_ (url, options) {
  
    // defaults
    options = options || {method:'GET'};
    if (!options.hasOwnProperty("muteHttpException")) {
      options.muteHttpExceptions = true;
    }

    // do the fetch
    var result = Utils.rateLimitExpBackoff (function() {
      return UrlFetchApp.fetch (url + "?auth=" + token_, options);
    });
    
    return {
      ok: result.getResponseCode() === 200,
      data: result.getResponseCode() === 200 ? JSON.parse(result.getContentText()) : null,
      response:result
    }

  };
 
  return self;
};
