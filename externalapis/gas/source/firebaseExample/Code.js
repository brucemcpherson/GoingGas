// Copy data from spreadsheet to fusion table
function sheetCopy() {
  
  // get the sheet
  var sob = new SheetOb().open(Settings.LOOKUP.ID, Settings.LOOKUP.NAME);

  // get the firebase table
  var firebase = new Firebase()
    .setRoot(Settings.FIREBASE.ROOT)
    .setToken(Settings.FIREBASE.AUTH, Settings.FIREBASE.SECRET);
  
  // delete all data in the table
  firebase.remove();
  
  // insert the data from the sheet
  sob.getData().forEach(function(d) {
    var result = firebase.put(d,'/'+d[Settings.HEADINGS.CODE]);
    if (!result.ok) throw result.response.getContentText();
  });
  
  // do a query to se what we have
  Logger.log(JSON.stringify(firebase.get().data));
  
}

function y() {

  // set up the database 
  var firebase = new Firebase()
    .setRoot(Settings.FIREBASE.ROOT)
    .setToken(Settings.FIREBASE.AUTH, Settings.FIREBASE.SECRET);
  
  var result = firebase.remove();
  if (!result.ok) throw result.response.getContentText();

  var result = firebase.put({name:"United Airlines", carrier:"UA"},'/UA');
  if (!result.ok) throw result.response.getContentText();

  var result = firebase.get('/UA');
  if (!result.ok) throw result.response.getContentText();


  var result = firebase.patch({name:"United Airlinesx"},'/UA');
  if (!result.ok) throw result.response.getContentText();

  
  var result = firebase.post({name:"British Airways", carrier:"BA"},'/BA');
  if (!result.ok) throw result.response.getContentText();
  
  var result = firebase.remove('/BA/' + result.data.name);
  if (!result.ok) throw result.response.getContentText();
  
  var result = firebase.get();
  if (!result.ok) throw result.response.getContentText();
  Logger.log(result.data);
  
  
}

