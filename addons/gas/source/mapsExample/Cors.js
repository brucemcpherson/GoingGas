 var Cors = (function (cors) {
   
   'use strict';
   
   // thanks to http://enable-cors.org/ for info on cors/html5
   
   /**
   *do a cors request
   *@param {function} callback the load callback
   *@param {function} errorCallback the error callback
   *@param {string}  url the url
   *@param {string} method the method (default GET)
   *@param {*} payload the optional payload
   *@return {object} the response
   */
   cors.request= function (callback, errorCallback, url, method, payload) {
     
     // get the appropriate xhr
     var xhr = getXhr_ ();
     if (!xhr) throw 'cant do cors with this browser';
     
     // now we can go
     xhr.open(method || "GET", url, true);
     
     // set up callbacks
     xhr.onload = function(response) {
       // meed to catch this since it doesnt actually catch http errors
       if (response.target.status < 200 || response.target.status >= 300) {
         errorCallback(response.target);
       } else {
         callback(response.target);
       }
       
     }
     xhr.onerror = function(response) {
       errorCallback(response.target);
     }
     
     // execute
     return xhr.send(payload);
     
     /**
     * get the correct xhr object for the browser being used
     * @return {XDomainRequest|XMLHttpReQuest} the xhr
     */
     function getXhr_() {
       
       // likely to be this, unless its IE
       var xhr = new XMLHttpRequest();
       return isDefined_(xhr.withCredentials) ?
         xhr : (isDefined_(XDomainRequest) ? new XDomainRequest() : undefined);
     }
     
     function isDefined_(ob) {
       return typeof ob !== typeof undefined;
     }
   }
   return cors;
   
 })(Cors || {});
