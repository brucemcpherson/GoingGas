var FirebaseAuth = (function (firebaseAuth) {

  /**
   * generate a jwt for firebase using default settings
   * @param {object} data the data package
   * @param {string} secret the jwt secret
   */
  firebaseAuth.generateJWT = function(data, secret) {
    
    var header = getHeader_ ();
    var claims = getClaims_ (data);
    var jwt = header + "." + claims;
    
    // now sign it 
    var signature = Utilities.computeHmacSha256Signature (jwt, secret);
    var signed = unPad_ (Utilities.base64EncodeWebSafe(signature));

    // and thats the jwt
    return jwt + "." + signed;
  };
  
  /**
   * generate a jwt header
   * return {string} a jwt header b64
   */
  function getHeader_ () {
  
    return unPad_(Utilities.base64EncodeWebSafe(JSON.stringify( {
      "alg": "HS256",
      "typ": "JWT" 
    })));
  }
  
  /**
   * generate a jwt claim for firebase
   * return {string} a jwt claimsm payload b64
   */
  function getClaims_  (data) {
    
    return unPad_ (Utilities.base64EncodeWebSafe( JSON.stringify( {
      "d" : data || {},
      "iat": Math.floor(new Date().getTime()/1000),
      "v": 0
    })));
  }
  
  /**
   * remove padding from base 64
   * @param {string} b64 the encoded string
   * @return {string} padding removed
   */
  function unPad_ (b64) {
    return b64 ?  b64.split ("=")[0] : b64;
  }

  return firebaseAuth;
})(FirebaseAuth || {});

