/**
 * this is to run on the client
 * but im working with as a .gs file
 */

// all code for client server communication
var Client = (function(client) {
  
  /**
   * generic function to execute stuff on the server
   * @param {string} serverFunction the function to execute
   * @param {string} successFunction what to do when it succeeds
   * @param {*} serverArg arg to pass to the server
   */
  client.execute = function (serverFunction, successFunction, serverArg) {

    // this executes a function asynchronously on the server
    // under control of the client
    google.script.run
    
      // this will be executed if it fails
      .withFailureHandler(function (err) {
        App.reportMessage (err);
      })
      
      // this will be executed if it succeeds
      .withSuccessHandler (successFunction)
      
      // this is what gets executed
      [serverFunction](serverArg);

  };
      
      
  /**
   * get data from server
   * @param {function} [initFunction] call on successful if its there.
   */
  client.getData = function () {
  
    // ask for data
    client.execute ( 'getData' , function (result) {
      
      // always store the latest checksum
      App.globals.sheet.checksum = result.checksum;
      
      // if the position has changed, but data has not we- may need to change the selected item && re-map
      if (App.globals.sheet.position.row !== result.position.row && !result.package) {

        // change the selected option & redo  & remap if necessary
        Render.selectionChanged(result.position);
        App.globals.sheet.position = result.position;
        
      } 
      
      // if the checksum has changed, then data.package is defined, store an update everything
      if (result.package) {
        App.globals.sheet.position = result.position;
        App.globals.sheet.package = result.package;
        
        // build the drop down list & create map
        Render.build();        

      }
      
      // schedule the next trip
      client.startPolling();
      
    },App.globals.sheet.checksum);
  }
  
  
  /**
   * trip to the server to look for updates
   */
  client.startPolling = function () {
    setTimeout(function(){ 
      client.getData();
    }, App.globals.polling.interval);
  };
  
  return client;
  
})(Client || {});



