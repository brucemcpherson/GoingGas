var Utils = (function (utils) {
/**
   * recursive rateLimitExpBackoff()
   * @param {function} callBack some function to call that might return rate limit exception
   * @param {number} [sleepFor=1000] optional amount of time to sleep for on the first failure in missliseconds
   * @param {number} [maxAttempts=5] optional maximum number of amounts to try
   * @param {number} [attempts=1] optional the attempt number of this instance - usually only used recursively and not user supplied
   * @param {boolean} [optLogAttempts=false] log re-attempts to Logger
   * @param {function} [optchecker] function should throw an error "force backoff" if you want to force a retry
   * @return {*} results of the callback 
   */
  utils.tryAgain = "force backoff anyway";
  utils.backoffErrors = [
    "Exception: Service invoked too many times",
    "Exception: Rate Limit Exceeded",
    "Exception: Quota Error: User Rate Limit Exceeded",
    "Service error: Spreadsheets",
    "Exception: User rate limit exceeded",
    "Exception: Internal error. Please try again.",
    "Exception: Cannot execute AddColumn because another task",
    "Service invoked too many times in a short time:",
    "Exception: Internal error.",
    "Exception: Превышен лимит: DriveApp.",
    utils.tryAgain
  ];
  
  utils.rateLimitExpBackoff = function ( callBack, sleepFor ,  maxAttempts, attempts , optLogAttempts , optChecker) {
  
    // can handle multiple error conditions by expanding this list
    function errorQualifies (errorText) {
      
      return utils.backoffErrors.some(function(e){
                return  errorText.toString().slice(0,e.length) == e  ;
              });
    }
    
    
    // sleep start default is  1 seconds
    sleepFor = Math.abs(sleepFor || 1000);
    
    // attempt number
    attempts = Math.abs(attempts || 1);
    
    // maximum tries before giving up
    maxAttempts = Math.abs(maxAttempts || 5);
    
    // make sure that the checker is really a function
    if (optChecker && typeof(callBack) !== "function") {
      throw ("if you specify a checker it must be a function");
    }
    
    // check properly constructed
    if (!callBack || typeof(callBack) !== "function") {
      throw ("you need to specify a function for rateLimitBackoff to execute");
    }
    
    // try to execute it
    else {
      
      try {
  
        var r = callBack();
        
        // this is to find content based errors that might benefit from a retry
  
        return optChecker ? optChecker(r) : r;
      }
      catch(err) {
      
        if(optLogAttempts)Logger.log("backoff " + attempts + ":" +err);
        // failed due to rate limiting?
        if (errorQualifies(err)) {
          
          //give up?
          if (attempts > maxAttempts) {
            throw (err + " (tried backing off " + (attempts-1) + " times");
          }
          else {
            
            // wait for some amount of time based on how many times we've tried plus a small random bit to avoid races
            Utilities.sleep (Math.pow(2,attempts)*sleepFor) + (Math.round(Math.random() * sleepFor));
            
            // try again
            return rateLimitExpBackoff ( callBack, sleepFor ,  maxAttempts , attempts+1,optLogAttempts);
          }
        }
        else {
          // some other error
          throw (err);
        }
      }
    }
  };
  
 /** 
  * execute a regex and return the single match
  * @param {Regexp} rx the regexp
  * @param {string} source the source string
  * @param {string} def the default value
  * @return {string} the match
  */
  utils.getMatchPiece = function (rx, source, def) {
    var f = rx.exec(source);
    
    var result = f && f.length >1 ? f[1] : def;
    
    // special hack for boolean
    if (typeof def === typeof true) {
      result = utils.yesish ( result );
    }
    
    return result;
  }
  
  utils.yesish = function(s) {
    var t = s.toString().toLowerCase();
    return t === "yes" || "y" || "true" || "1";
   }

  return utils;
  
})(Utils || {});
