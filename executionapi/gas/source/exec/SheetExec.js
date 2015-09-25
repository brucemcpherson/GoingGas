// This script contains functions to be accessed by the execution API
// to manipulate sheets
var SheetExec = function () {

  var self = this, sheet_ , lowerCase_;
  
  /**
  * open a sheet
  * @param {string} id the id
  * @param {string} sheetName the sheet name
  * @return {SheetExec} self
  */
  self.sheetOpen = function (id, sheetName) {
    sheet_ = SpreadsheetApp.openById (id).getSheetByName(sheetName);
    return self;
  };
  
  /**
  * get the sheet associated with this object
  * @param {string} id the id
  * @return {Sheet} the sheet
  */
  self.getSheet= function() {
    return sheet_;
  };
  
 /**
  * whether to convert headings to lowercase
  * @param {boolean} lc whether to convert headings to lower case
  * @return {SheetExec} self
  */
  self.setLowerCase = function(lowerCase) {
    lowerCase_ = lowerCase;
    return self;
  };
  
  /**
  * get values fro sheet
  * @param {string} [a1Range] get the data for a particular range, default all
  * @param {string} [attrib=Values] the attribute to get
  * @return {[[*]]} data the data
  */
  self.getValues = function (a1Range , attrib) {
    return (a1Range ? sheet_.getRange(a1Range) : sheet_.getDataRange())
               ['get' + (attrib ? attrib : 'Values')]();
  };
  
 /**
  * get data from sheet
  * @param {string} [a1Range] get the data for a particular range, default all
  * @param {string} [attrib=Values] the attribute to get
  * @return {[object]} data the data as objects
  */
  self.getData = function (a1Range , attrib) {
    return self.convertToObjects ( self.getValues (a1Range , attrib) );
  };
  
 /**
  * set data to sheet
  * @param {[object]} data rge data to set
  * @param {string} [attrib=Values] the attribute to get
  * @param {string} [a1Range=a1] the place to start writing
  * @return {SheetExec} self
  */
  self.setData = function (data , attrib,a1Range) {
    return self.setValues(self.convertToValues ( data ) , attrib, a1Range);
  };
  
 /**
  * set values back to sheet
  * @param {[[*]]} data rge data to set
  * @param {string} [attrib=Values] the attribute to get
  * @param {string} [a1Range=a1] the place to start writing
  * @return {SheetExec} self
  */
  self.setValues = function (values , attrib,a1Range) {
    
    if (values.length) {
      var range = sheet_.getRange(a1Range || 'A1');
      sheet_.getRange(range.getRow(),range.getColumn(),values.length,values[0].length)
           ['set' + (attrib ? attrib : 'Values')](values);
    };
    return values;
    
  };
  
 /**
  * clear contents
  * @param {string} [a1Range] clear the data in a particular range, default all
  * @return {SheetExec} self 
  */
  self.clearContent = function (a1Range) {
    (a1Range ? sheet_.getRange(a1Range) : sheet_.getDataRange()).clearContent();
    return self;
  };
  
  /**
  * convert to objects
  * @param {[[*]]} values convert values to objects
  * @return {[*]} the object array
  */
  self.convertToObjects = function (values) {
    
    // make a copy of the data and get the heading
    var copyValues = values.slice();
    var heads = copyValues.shift();
    
    // reduce to objects
    return copyValues.map (function(row) {
      var idx =0;
      return row.reduce(function(p,c) {
        p[heads[idx++][lowerCase_ ? 'toLowerCase' : 'toString']()] = c;
        return p;  
      },{});
    });
    
  };
  
  /**
  * convert to values
  * @param {[*]} dataOb data as objects
  * @return {[[*]]} convert to values
  */
  self.convertToValues = function (dataOb) {
    
    return dataOb.length ? (
      [Object.keys(dataOb[0]).map(function(k) {
        return k;
      })]
      .concat (dataOb.map(function(row,i) {
          return Object.keys(row).map(function(k) {
            return  row[k];
          })
        }))
    ) : null;
    
  };
  
 /**
  * convert dates to ISO
  * @param {[object]} data the data
  * @return {[object]} the safe data
  */
  self.convertDatesToIso = function (data) {
    
    return data.map(function(row) {
      return Object.keys(row).reduce(function(p,c) {
        p[c] = row[c].constructor.name === 'Date' ? row[c].toISOString(): row[c];
        return p;
      },{});  
    })
  };
  

  
  return self;

};