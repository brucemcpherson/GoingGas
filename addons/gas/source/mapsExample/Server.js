

var Server = (function(server) {
  'use strict;'
  
  server.getData = function (checksum) {
    
    // get data from activesheet
    var sob = new SheetOb().open();
   
    // calculate the data checksum
    var package = {
      data:sob.getData(),
      range:sob.getSheet().getDataRange().getA1Notation(),
      name:sob.getSheet().getName()
    }
    
    // calculate the checksum
    var newChecksum = Utils.checksum (package);
    var activeRange = sob.getSheet().getActiveRange();
    
    // return the data , null if the same as before
    return {
      package: checksum  === newChecksum ? null : package,
      position: {
        range:activeRange.getA1Notation(),
        row:activeRange.getRow(),
        column:activeRange.getColumn()
      },
      checksum:newChecksum
    }
  };
  
  return server;
})(Server || {});

// need to expose globally any functions to be called from the client;
function  getData (arg) {
  return Server.getData(arg);
}