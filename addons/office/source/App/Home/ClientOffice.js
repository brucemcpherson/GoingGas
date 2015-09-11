
var Client = (function(client) {
  
  /**
   * set up binding to data set
   */
  client.bind = function() {
    
	// add a named table as binding
	// dont know how to get the name of an active table so its hard coded
	Office.context.document.bindings.addFromNamedItemAsync(
		App.globals.sheet.tableName,Office.CoercionType.Table,
        { id: App.globals.sheet.tableName }, 
		function (asyncResult) {
            if (asyncResult.status === Office.AsyncResultStatus.Succeeded) {
				
				// store the binding object for later
				var binding = App.globals.sheet.binding = asyncResult.value;
				
				// get the first chunk of data
				client.getData();
				
				// add a data change handler
				binding.addHandlerAsync (
					Office.EventType.BindingDataChanged, function (e)  {
						client.getData();	
					});
					
				// add a selection change handler
				binding.addHandlerAsync (
					Office.EventType.BindingSelectionChanged, function (e)  {
						
						// adjust position to match Apps Script row /col numbers.
						var position = {
							row:e.startRow +2,
							column:e.startColumn+1,
							columnCount:e.columnCount,
							rowCount:e.rowCount
						};
						
						// see if position has changed
						Render.selectionChanged(position);
						App.sheet.position = position;
					});
					
            }
            else {
                App.reportMessage('Error:', asynchResult.error.message);
            }
        });
    };
	
	/**
	* get data following a binding change event
	*/
	client.getData = function() {
		App.globals.sheet.binding.getDataAsync(function(asyncResult) {
			
			
			var headers = asyncResult.value.headers[0];
			var data = asyncResult.value.rows;
			
			// now convert to a more palatable format
			App.globals.sheet.package.data = data.map(function(row) {
				var col =0;
				return row.reduce(function(p,c) {
					p[headers[col++]] = c;
					return p;	
				},{})
			}); 
			
			// use the changed data
			Render.build();
			
			// get to the right position
			Render.selectionChanged(App.sheet.position);
		});
	};

  return client;
  
})(Client || {});



