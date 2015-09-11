Office.initialize = function (reason) {

	// wait for the viz lib to have loaded
	google.maps.event.addDomListener(window, 'load', function () {
	
	  // initialize the settings
	  App.init();
	  
	  // get the countries from the API
	  App.getCountries();
	  
	  // set up listeners
	  App.listeners();
	  
	  // bind data
	  Client.bind();

	});
};
