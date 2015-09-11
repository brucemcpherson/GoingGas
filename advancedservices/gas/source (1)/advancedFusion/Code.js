// Copy data from spreadsheet to fusion table
function sheetCopy() {
  
  // get the sheet
   var sob = new SheetOb().open(Settings.LOOKUP.ID, Settings.LOOKUP.NAME);

  // get the fusion table or create it if we dont know it
  if (!Settings.FUSION.ID) {
    Settings.FUSION.ID = Fusion.createTable (Settings.FUSION.NAME,sob).tableId;
  }
  
  // delete all data in the table
  Fusion.clearData(Settings.FUSION.ID);
  
  // insert the data from the sheet
  Fusion.insertRows (Settings.FUSION.ID , sob);
  
  // do a query
  Logger.log(Fusion.query (Settings.FUSION.ID,"carrier = 'QF'"));
  
  // write back the settings with any updated stuff
  setProperties (Settings);

}
