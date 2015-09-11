var SheetOb = function () {
  'use strict';
  
  var sheet_ , values_ , heads_ , dataOb_ , headerOb_ , self = this;
  
  /**
   * open a sheet
   * @param {string} id the book id
   * @param {string} sheetName the sheet name
   * @return {Sheet} the sheet
   */
  self.open = function ( id, sheetName ) {
    var ss = id ? SpreadsheetApp.openById(id) : SpreadsheetApp.getActiveSpreadsheet();
    sheet_ = sheetName ? ss.getSheetByName(sheetName) : ss.getActiveSheet();
    return self;
  };
  
  /**
   * get the sheet object
   * @param {Sheet} the sheet
   */
  self.getSheet = function () {
    return sheet_;
  };
  
  /**
   * refresh the data and turn it into a json object
   * @return {object} a JSON object representing the sheet data
   */
  self.refresh = function () {
    values_ = sheet_.getDataRange().getValues();
    heads_ = values_.shift();
    headerOb_ = makeHeaderOb (heads_);
    dataOb_ = makeDataOb (headerOb_ , values_);
    return self;
  };
  
  /**
   * get the header ob
   * @return {object} the headerOb
   */
   self.getHeaderOb = function () {
     if (!headerOb_) self.refresh();
      return headerOb_;
   };
  
  /**
   * get the data object , provoke a refresh if its not already done
   * @return {object} a JSON object represetnting the sheet data
   */
  self.getData = function () {
    if (!dataOb_) self.refresh();
    return dataOb_;
  };
  
  /**
   * write a new data object, where the headers match
   * @param {object} data
   * @return {SheetOb} self
   */
  self.dump = function (data) {
  
    // map the new values
    var values = data.map(function(d) {
    
      return Object.keys(headerOb_).reduce(function(p,c) {
        p[headerOb_[c]] = d[c];
        return p;
      },new Array(Object.keys(headerOb_).length));
    });
    
    // clear the data from the sheet if necessary
    var dr = sheet_.getDataRange();
    if (dr.getNumRows() > values.length +1) {
      sheet_.getRange (values.length+1 , 1 , dr.getNumRows() - values.length -1, dr.getNumColumns()).clearContents();
    }
    
    // write out the new values
    if(values.length) { 
      sheet_.getRange (2,1, values.length, Object.keys(headerOb_).length).setValues(values);
    }
    
    // refresh this object
    self.refresh();
    
    return self;
  };
  
  /**
   * make the values array into an object
   * @param {object} headOb the head object
   * @param {*[][]} values the data values
   * @return the data values as an object
   */
  function makeDataOb (headOb,values) {
      return values.map(function(row) {
          return Object.keys(headOb).reduce(function(p,c) {
            p[c] = row[headOb[c]];
            return p;
          },{});
      });
  }
  
  /**
   * make the headings array into an object with index numbers for columns
   * @param {*[][]} values the heading values
   * @return the heading values as an object
   */
  function makeHeaderOb (head) {
    var idx = 0;
    return head.reduce(function(p,c) {
      p[c.toString().toLowerCase()] = idx++;
      return p;
    },{});
  }
    
  return self;
};
