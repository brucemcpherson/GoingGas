
// we'll do this in a namespace
var Carrier = (function (carrier) {

  /**
   * open a book given its id
   * @param {string} id the id
   * @return {Spreadsheet} the workbook
   */
  carrier.openWorkbook = function (id) {
    return SpreadsheetApp.openById(id);
  };
  
  
  /**
   * update the carrier workbook with the contents of the update
   * @param {object} props the properties
   */
  carrier.update = function (props) {
  
    // open the carrier lookupsheet
    var cs = carrier.openWorkbook ( props.carrier.id ) 
                    .getSheetByName( props.carrier.sheet );
    
    // open the update sheet
    var us = carrier.openWorkbook ( props.update.id)
                    .getSheetByName( props.update.sheet );
    
    // do the work
    carrier.doTheWorkBasic(cs, us);
    

  };
  
  /**
   * update the carrier workbook with the contents of the update
   * @param {Sheet} cs the carrier sheet
   * @param {Sheet} us the update sheet
   */ 
  carrier.doTheWorkBasic = function ( cs , us) {

    // get the data from both sheets
    var usData = us.getDataRange().getValues();
    var csData = cs.getDataRange().getValues();

    // get the headers, and clean the data
    var usHead = usData.shift();
    var csHead = csData.shift();
   
    // make headerobs so we know where the various columns are
    var usHeaderOb = makeHeaderOb (usHead);
    var csHeaderOb = makeHeaderOb (csHead);
    
    // find not alsready in the cs list and add to end of cs list, then map to same format as the cs list
    var changes = usData.filter (function(d) {
      return  !csData.some(function(e) { 
        return e[csHeaderOb.carrier].toString().toLowerCase() === d[usHeaderOb.carrier].toString().toLowerCase();
      });
    })
    .map(function(d) {
        var row = [];
        row [csHeaderOb.carrier] = d[usHeaderOb.carrier];
        row [csHeaderOb.name] = d[usHeaderOb.name];
        row [csHeaderOb['date added']] = new Date();
        return row;
    });
    
    // write that out
    if (changes.length) {
      cs.getRange(csData.length+2, 1 , changes.length , changes[0].length).setValues(changes);
    }


    function makeHeaderOb (head) {
      var idx = 0;
      return head.reduce(function(p,c) {
        p[c.toString().toLowerCase()] = idx++;
        return p;
      },{});
    }

  };
  
  
  return carrier;
  
})(Carrier || {});


