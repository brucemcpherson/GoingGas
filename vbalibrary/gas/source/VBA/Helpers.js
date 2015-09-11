 /**
   * use a default value is given value is undefined
   * @param {*} arg given value
   * @param {*} defaultValue value to use if given value IsMissing
   * @return {*} the new value 
   */
  function fixOptional (arg, defaultValue) {
    return isUndefined(arg) ? defaultValue : arg;
  }
  
  /**
   * Check if a value is defined
   * @param {*} arg given value
   * @return {boolean} true if undefined
   */
  function isUndefined ( arg) {
    return typeof arg == 'undefined';
  }
 
 /**
  * Check if a value is an array
  * @param {*} arg given item
  * @return {boolean} true if array
  */
  function isArray (arg) {
    return Array.isArray (arg);
  }
  
/** 
 * isObject
 * check if an item is an object
 * @param {object} obj an item to be tested
 * @return {boolean} whether its an object
 */
  function isObject (obj) {
    return obj === Object(obj);
  }

/**
 * get the data from a range and convert it into an array of key value pairs
 * @param {Range} range a spreasheet range
 * @return {object[]} an array of objects, one element per row
 */
function convertValuesToObjects (range) {
  
  // get the data
  var data = range.getValues();
  // get the header row
  var headers = data.shift() ;

  // now create a dataOb
  return (data || []).map (function(row) {
    var cellIndex = 0;
    return row.reduce(function (p,c) {
      var key = headers[cellIndex++].toString();
      if (p.hasOwnProperty(key)) {
          throw 'duplicate header ' + key;
      }
      p[key] = c;
      return p;
    },{});
  });

}