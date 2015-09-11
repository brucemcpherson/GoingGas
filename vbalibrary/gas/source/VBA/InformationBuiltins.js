    
  //Constant replacements
  var Empty = "", vbLf = "\n" , Null = null ;
  
  // days of the week
  var vbSunday = 1,
      vbMonday = 2,
      vbTuesday = 3,
      vbWednesday = 4,
      vbThursday = 5,
      vbFriday = 6,
      vbSaturday = 7;
  
  // change this to alter the behavior of week starts
  var vbUseSystemDayOfWeek = vbWednesday;
  
  var vbFirstJan1     = 1, // Start with the week in which January 1 occurs (default)
      vbFirstFourDays = 2, // Start with the week that has at least four days in the new year
      vbFirstFullWeek = 3  //Start with the first full week of the new year

  // change this for the system behavior for week numbers
  var vbUseSystem = vbFirstJan1;
  
  /**
  * Returns whether this is an 'empty' value
  * @param {*} value item to check
  * @return {boolean} true if item is empty
  */
  function IsEmpty (value) {
    return typeof(value) === "string" && value === Empty;
  }
  
  /**
   * Returns whether item is a valid date
   * @param {string} sDate item to check
   * @return {boolean} true if item can be converted to a date
   */
  var IsDate = function (sDate) {
    var tryDate = new Date(sDate);
    return (tryDate.toString() != "NaN" && tryDate != "Invalid Date") ;
  }
  
  /**
   * Returns whether item is a valid number
   * @param {string} theString item to check
   * @return {boolean} true if item can be converted to a number
   */
  function IsNumeric (theString) {
    return isFinite(parseFloat(theString));
  }
  
  /**
   * Returns whether item is a missing argument
   * @param {*} value item to check
   * @return {boolean} true if item is undefined
   */
  function IsMissing (value) {
    return isUndefined(value);
  }
  
  /**
   * Returns whether item an error
   * @param {*} value item to check
   * @return {boolean} true if item is undefined
   */
  function IsError (value) {
    return isNaN(value);
  }
  
  /**
   * Returns whether an object is defined
   * @param {*} value item to check
   * @return {boolean} true if item is undefined
   */
  function IsNothing (value) {
    return value ? true : false;
  }
  
  /**
   * Returns whether item is an object
   * @param {*} value item to check
   * @return {boolean} true if item is an object
   */
  function IsObject (value) {
    return isObject (value);
  }
  
  /**
   * Returns whether item is an array
   * @param {*} value item to check
   * @return {boolean} true if item is an array
   */
  function IsArray (value)  {
    return isArray(value) ;
  }
  
  /**
   * Returns whether item is null
   * @param {*} value item to check
   * @return {boolean} true if item is exactly null
   */
  function IsNull (value) {
    return value===null ;
  }
  
  /**
   * Returns item type
   * @param {*} value item to check
   * @return {string} the java script type 
   */
  function VarType (value) {
    return typeof value;
  }

  /**
   * Returns item type
   * @param {*} value item to check
   * @return {string} the javascript/object constructtor name 
   */
  function TypeName (value) {
    return isObject (value)  ? (value.constructor ? value.constructor.name : typeof value) : typeof value;  
  }


