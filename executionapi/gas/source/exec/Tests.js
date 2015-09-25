function testSheets() {
  // open the sheet
  var sheetExec = new SheetExec().sheetOpen(Settings.LOOKUP.ID, Settings.LOOKUP.NAME);
  
  // get all the data
  var values = sheetExec.getValues();
  
  // convert values to objects
  var data = sheetExec.convertToObjects(values);
  
  // sort them
  var sortedData = data.sort(function(a,b) {
    return a.carrier > b.carrier ? 1 : (a.carrier < b.carrier ? -1 :0);
  });
  
  // convert it back
  var sortedValues = sheetExec.convertToValues (sortedData);

  // clear the sheet
  sheetExec.clearContent();
  
  // write it back
  sheetExec.setValues (sortedValues);
 
  
}



function testExec() {
  
  // get the data
  var data = execGetData ({
    id:Settings.LOOKUP.ID, 
    sheetName:Settings.LOOKUP.NAME
  });

  // write it
  execSetData ({
    id:Settings.LOOKUP.ID, 
    sheetName:Settings.LOOKUP.NAME,
    data:data
  });
 
  
}

function testMatch() {
  var result = execMatch(
    ["scheduled to take LH123", 
     "not an interesting XX123 airline number",
     "Going to AU on QF928 tomorrow"
    ]);
  return result;
}

function testUpdate () {
  execLog (testMatch());
}

function testSource() {

  Logger.log( execGetSource([{module:'Executes', functions:['execGetData','getRegex']}, {module:'Settings'} ]));

}