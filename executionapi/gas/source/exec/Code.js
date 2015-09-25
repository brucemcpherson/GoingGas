/**
 * The function in this script will be called by the Apps Script Execution API.
 */


function test() {
  Logger.log(JSON.stringify(executeMatch(
    ["scheduled to take LH123", 
     "not an interesting XX123 airline number",
     "Going to AU on QF928 tomorrow"
    ])));
}

/**
* @param {[string]} flightNumbers to check
* @return {object} the result
*/
function executeMatch (flightNumbers) {
  
  // get the sheet data
  var lookup = getSheetData(Settings.LOOKUP.ID, Settings.LOOKUP.NAME);
  
  // generate a regex for flightnumbers of each interesting airline
  var rx = new RegExp (getRegex(lookup) ,'gmi');
  
  return flightNumbers.map(function(flightNumber) {
    
    
    // match against given flight code  
    var found = rx.exec(flightNumber);
    
  // return the airline code, name and the flight number
    return found ? 
      { status:"ok",
        flight:found[0],
        carrier:found[1],
        name:lookup.filter(function(d) { 
          return d[Settings.HEADINGS.CODE].toLowerCase() === found[1].toLowerCase();
        })[0][Settings.HEADINGS.NAME]
      } :  
      { status:'not found',
        flight:flightNumber
      };
  
  });
}


/**
* @param {string} id the workbook id
* @param {string} sheetName the sheet name
* @return {[object]} a array of json objects representing the sheet data
*/
function getSheetData  (id, sheetName ) {
  
  // get the data
  var values_ = SpreadsheetApp
    .openById(id)
    .getSheetByName(sheetName)
    .getDataRange()
    .getValues();
  
  // get the header row
  var heads_ = values_.shift();
  
  // convert it into a JSON object
  return values_.map(function(d) {
    var idx= 0;
    return heads_.reduce(function(p,c){
      p[c] = d[idx++]; 
      return p;
    },{})
  });
  
}
