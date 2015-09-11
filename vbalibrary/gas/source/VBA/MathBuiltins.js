/**
 * Abs - VBA equivalent - return absolute value
 * @param {number} value the value to convert
 * @return {number} the absolute value
 */
 function Abs(value) {
   return Math.abs(value);
 }

 
 /**
 * Cos - VBA equivalent - return cosine value
 * @param {number} value the value to convert
 * @return {number} the exp value
 */
 function Cos (value) {
   return Math.cos(value);
 }
 
/**
 * Exp - VBA equivalent - return exp value
 * @param {number} value the value to convert
 * @return {number} the absolute value
 */
 function Exp (value) {
   return Math.exp(value);
 }
 
/**
 * int - VBA equivalent - return int value
 * @param {number} value the value to convert
 * @return {number} the absolute value
 */
 function Int (value) {
   return Math.floor(value);
 }
 
/**
 * log - VBA equivalent - return log value
 * @param {number} value the value to convert
 * @return {number} the log value
 */
 function Log (value) {
   return Math.log(value);
 }
 
 /**
 * Rnd - VBA equivalent - return log value
 * @param {number} value seed is ignored in JS
 * @return {number} the random value
 */
 function Rnd (value) {
   return Math.random();
 }
 
/**
 * Round - VBA equivalent - return rounded value
 * @param {number} value number to round
 * @param {number} places is igniored is JS
 * @return {number} the rounded value
 */
 function Round (value, places) {
   return isUndefined(places) ? Math.round (value) : parseFloat(value.toFixed(places));
 }
 
/**
 * Sin - VBA equivalent - return sine value
 * @param {number} value to get sine of
 * @return {number} the sine value
 */
 function Sin (value) {
     return Math.sin (value);
 }
 
 /**
 * Sqr - VBA equivalent - return sqrt value
 * @param {number} value to get sine of
 * @return {number} the sqrt value
 */
 function Sqr (value) {
     return Math.sqrt(value) ;
 }
 
 /**
 * Tan - VBA equivalent - return tan value
 * @param {number} value to get tan of
 * @return {number} the tan value
 */
 function Tan (value) {
     return Math.tan (value);
 }
 
