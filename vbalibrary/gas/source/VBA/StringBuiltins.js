/**
 * Asc - VBA equivalent - Returns a numeric Ascii char code given a character
 * @param {string} character Returns an Integer value representing the character code corresponding to a character
 * @return {number} the converted code
 */
 function Asc (character) {
   return character.charCodeAt(0);
 }
 
 /**
 * CStr - VBA equivalent - Returns a value converted to a string
 * @param {*} value the value to be converted
 * @return {string} the converted string
 */
 function CStr (value) {
   return value.toString();
 }

/**
 * CLng - VBA equivalent - Returns a value converted to a number
 * @param {*} value the value to be converted
 * @return {number} the converted number
 */
 function CLng (value) {
   return parseInt (value , 10);
 }
 
 /**
 * CInt - VBA equivalent - Returns a value converted to a number
 * @param {*} value the value to be converted
 * @return {number} the converted number
 */
 function CInt (value) {
   return parseInt (value, 10);
 }
 
 /**
 * CDbl - VBA equivalent - Returns a value converted to a number
 * @param {*} value the value to be converted
 * @return {number} the converted number
 */
 function CDbl (value) {
   return parseFloat (value);
 }
 
/**
 * cBool - VBA equivalent - Returns a value converted to a number
 * @param {*} value the value to be converted
 * @return {boolean} the converted bool
 */
 function cBool (value) {
   return value ? true : false;
 }
 
 /**
 * cDate - VBA equivalent - Returns a value converted to a number
 * @param {string} dateString  the date to be converted
 * @return {Date} the date object
 */
 function cDate (dateString) {
   return new Date (dateString);
 }
/**
 * Chr - VBA equivalent - Returns a string given a char code
 * @param {number} code the code to be converted
 * @return {string} the converted string
 */
 function Chr (code) {
   return String.fromCharCode(code);
 }
 
 /**
 * InStr - VBA equivalent - Returns the position (starting at 1) of the search string
 * @param {number} [start=1] the start position
 * @param {string} [stringToLookin=""] the string to search
 * @param {string} [stringToLookFor=""] the string to look for
 * @param {number} [compareMethod=0] this is not implemented and ignored
 * @return {number} the start position of the string, or 0 if not found
 */
 function InStr (start, stringToLookin , stringToLookFor , compareMethod ) {
 
   // need a hack to identify whether the start argument is actually present 
   if (typeof start === 'number') {
     start = start || 1;
     var lookFor = (stringToLookFor || '').toString();
     var lookIn = (stringToLookin || '').toString();
   } 
   else {
     // it wasn't so shuffle them along
     var lookFor = (stringToLookin || '').toString();
     var lookIn = (start || '').toString();
     start = 1;
   }

   return (start > 1 ?  lookIn.slice (start -1) : lookIn ).indexOf(lookFor) + start;
 }

/**
 * InStrRev - VBA equivalent - Returns the position of the search string, starting right to left
 * @param {string} [stringToLookin=""] the string to search
 * @param {string} [stringToLookFor=""] the string to look for
 * @param {number} [start=-1] the start position -1 means the end
 * @param {number} [compareMethod=0] this is not implemented and ignored
 * @return {number} the start position of the string, or 0 if not found
 */
 function InStrRev (stringToLookin , stringToLookFor , start, compareMethod ) {

   var lookFor = (stringToLookFor || '').toString();
   var lookIn = (stringToLookin || '').toString();
   var start = (start || -1) === -1 ? lookIn.length : start;
   

   return (start < lookIn.length ?  lookIn.slice (0,start) : lookIn ).lastIndexOf(lookFor) + 1;
 }
 
 /**
 * Join - VBA equivalent - joins an array of values into a single string
 * @param {string[]} sourceArray tthe array to join
 * @param {string} [delimiter=" "] the item delimiter
 * @return {string} the join array items
 */
 function Join (sourceArray , delimiter) {
   return sourceArray.join (fixOptional (delimiter, ' '));
 }
 
 /**
 * Removes leading and trailing whitespace
 * @param {string} theString the item to be trimmed 
 * @return {string} The trimmed result
 */
 function Trim (theString) {
   return theString.toString().trim();
 }
 
 /**
  * Removes leading whitespace
  * @param {string} theString the item to be trimmed
  * @return {string} The trimmed result
  */
  function LTrim (theString) {
    return theString.toString().replace(/^\s+/, "");
  }
  
  /**
   * Removes trailing whitespace
   * @param {string} theString the item to be trimmed
   * @return {string} The trimmed result
   */
  function RTrim (theString) {
    return theString.toString().replace(/\s+$/, "");
  }
  
  /**
   * gets the .toString length
   * @param {string} theString the item 
   * @return {number} The length
   */
  function Len (theString) {
    return theString.toString().length ;
  }
  
  /**
   * gets the leftmost portion of an item
   * @param {string} theString the item 
   * @param {number} [length] length of result
   * @return {string} The left portion of the string
   */
  function Left (theString,length) {
    return theString.toString().slice(0,length);
  }
  
  /**
   * gets the rightmost portion of an item
   * @param {string|number} theString the item 
   * @param {number} [length] length of result
   * @return {string} The right portion of the string
   */
  function Right (theString,length) {
    var s = theString.toString();
    return s.slice(s.length - length ,s.length);
  }
  
  /**
   * gets and extract from a string
   * @param {string} theString the item 
   * @param {number} start start position(base 1) of extract
   * @param {number} [length]  Number of characters (default all remaining)
   * @return {string} The extracted string
   */
  function Mid (theString,start,length) {
    var s = theString.toString();
    start --;
    
    length = fixOptional ( length ,  s.length - start );
    return  s.slice ( start, length + start);
  }
  
  /**
   * Splits an item into an array of strings
   * @param {string} theString the item 
   * @param {string} [delimiter] delimiter(default space)
   * @param {number} [limit] max number of splits(default all)
   * @return {string[]} The split arrray of strings
   */
  function Split (theString,delimiter,limit) {
    return theString.toString().split(fixOptional(delimiter," "),fixOptional(limit,-1));
  }
  
  /**
   * Returns a string of the same character repeated n times
   * @param {number} repeatCount number of times to repeat
   * @param {string=} theString the character to repeat (default ' ');
   * @return {string} the string of repeats
   */
  function Rept (repeatCount,theString){
    return repeatCount > 0 ?  Array(n+1).join(CStr(fixOptional(theString,' '))) : '';
  }
  
  /**
   * Returns a string of ' ' repeated n times
   * @param {number} repeatCount number of times to repeat
   * @return {string} the string of blanks
   */
  function Space (repeatCount){
    return repeatCount > 0 ?  Array(repeatCount+1).join(' ') : '' ;
  }
  
  /**
   * Returns a string converted to lower case
   * @param {string} theString item to be converted
   * @return {string} item in lower case
   */
  function LCase (theString) {
    return theString.toString().toLowerCase();
  };
  
  /**
   * Returns a string converted to upper case
   * @param {string} theString item to be converted
   * @return {string} item in upper case
   */
  function UCase (theString) {
    return theString.toString().toUpperCase();
  };

