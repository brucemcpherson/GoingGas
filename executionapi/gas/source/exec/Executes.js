// these test out the execution API
/**
 * given a sheet id & name, get the data converted to objects
 * @param {object} options args
 *   @param {string} id the sheet id
 *   @param {string} sheetName the sheetName
 * @return {[*]} the data
 */
function execGetData (options) {

  // maybe there are no arguments
  options = options || {};
  var exec = new SheetExec();
  var data = exec.sheetOpen(options.id, options.sheetName).getData();
  
  // need to convert any dates since its not transferrable
  return exec.convertDatesToIso(data);

}

/**
 * given a sheet id & name, set the given data
 * @param {object} options args
 *   @param {string} id the sheet id
 *   @param {string} sheetName the sheetName
 *   @param {boolean} clearFirst whether to clear first
 */
function execSetData (options ) {

  // maybe there are defaults
  options = options || {};
  
  var sheetExec = new SheetExec().sheetOpen(options.id, options.sheetName);
  
  // clear it ?
  if (options.clearFirst) sheetExec.clearContent();
  
  // write the data
  sheetExec.setData ( options.data );

}

/**
* @param {[string]} flightNumbers to check
* @return {object} the result
*/
function execMatch (flightNumbers) {
  
  // get the sheet data
  var lookup = new SheetExec()
    .open(Settings.LOOKUP.ID, Settings.LOOKUP.NAME)
    .getData();
  
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
 * this one increments a log with all the found flights
 * @param {object} results the results from an execmatch
 * @return {[object]} the data from the log
 */
function execLog (results) {
  
  // get the sheet data
  var sheetExec = new SheetExec().sheetOpen(Settings.LOG.ID, Settings.LOG.NAME);
  var log = sheetExec.getData();

  /// log the results
  results.forEach(function (d) {

    if (d.status === "ok") {
      // need to log
      var findLog = log.filter(function(f) {
        return f[Settings.LOG.HEADINGS.FLIGHT].toLowerCase() === d.flight.toLowerCase();
      });
      
      // add if its new
      if (!findLog.length) {
        var item = {};
        item[Settings.LOG.HEADINGS.FLIGHT] = d.flight;
        item[Settings.LOG.HEADINGS.COUNT] = 0;
        log.push(item);
      }
      else {
        var item = findLog[0];
      }
      
      // increment
      item[Settings.LOG.HEADINGS.COUNT]++;

    }
  });
  
  /// write the data (no need to clear)
  sheetExec.setData (log);
  
}
/**
* make the regex for flight matching
* @param {object} lookup the lookup data
* @return {Regexp} the matching regex
*/
function getRegex (lookup) {
  
  // in case the sender canr do json objects
  var ob = typeof lookup === typeof 's' ? JSON.parse(lookup) : lookup;
  
  return '\\b(' +
    ob.map(function(d) { 
      return d[Settings.HEADINGS.CODE].toLowerCase();
    }).join("|") +
      ')([a-z]?)(\\d{1,4}[a-z]?)\\b';
}


/**
* get any code -- doesnt handle {}() in comments or strings properly yet
* @param {[object]} sourceToGet the source to get [{module:x, functions:[y]}]
* @return {[object]} the result [{source:the source, module:x, functions:[y]}]
*/
function execGetSource (sourceToGet) {
  
  return sourceToGet.map(function(d) {
    var module = ScriptApp.getResource(d.module).getDataAsString();
    
    if (d.functions) {
      var source =  d.functions.reduce(function(p,c) {
        var match = new RegExp('\\b\\(?\\s*function\\s*' + c + '|var\\s+'+c+'\\s*=\\s*\\(?\\s*function','gm').exec(module);  
        if (!match) {
          throw 'function ' + c + ' not found in module ' + d.module
        }
        
        // now find matching close {
        var depth, s = '', bracketStart = '{', bracketEnd = '}' ;
       
        module.slice (match.index).split('').some(function(r) {

          if (bracketStart == r) { 
            depth = (typeof depth === typeof undefined ? 1 : depth +1); 
          }
          if (bracketEnd == r) { 
            depth = (typeof depth === typeof undefined ? undefined : depth -1); 
          }
          s+=r;
          return depth ===0;
        });
        p += (s + '\n');
        return p;
      } ,'');
      return {module:d.module, functions:d.functions , source: source};
    }
    else {
      return {module:d.module, functions:d.functions , source: module};
    }
  });

  
}
