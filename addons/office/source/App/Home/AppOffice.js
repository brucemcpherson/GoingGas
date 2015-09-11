var App = (function (app) {

  'use strict';
  
  app.init = function () {
  // persistent client data
    app.globals = {
      sheet:{
        checksum:undefined,
        package:{},
        position:{
			row:2
		},
		tableName:'Table1',
		binding:undefined
      },
      polling:{
        interval:2000
      },
      divs: {
        mapCanvas:document.getElementById('map-canvas'),
        selector:document.getElementById('region-select'),
        message:document.getElementById('message')
      },
      countries: {
        url:'https://restcountries.eu/rest/v1/all',
        lookup:null,
        executed:false,
        interval:500
      },
      propertyNames: {
        region:'iso_region',
        arplat:'latitude_deg',
        arplon:'longitude_deg',
        title:'name',
        elevation:'elevation_ft',
        country:'iso_country',
        iata:'iata_code',
        municipality:'municipality'
      },
      map: {
        ob:null,
        options: {
         mapTypeId: google.maps.MapTypeId.ROADMAP,
         maxZoom:10
        },
        markers:[]
      }
    };
  };
  

  /**
  * this gets data about all countries from an API
  */
  app.getCountries = function () {
    
    // uses CORS
    Cors.request( 
      function (response) {
        //success
        var data = JSON.parse(response.responseText);
        // make into a lookup
        app.globals.countries.lookup = data.reduce (function(p,c){
          p[c.alpha2Code.toLowerCase()] = c;
          return p;
        },{});
        app.globals.countries.executed = true;
      }, 
      function (response) {
        app.reportMessage ('failed to get country data ' + response.statusText);
        app.globals.countries.executed = true;
      }, 
      app.globals.countries.url,
      "GET");
    
  };
  /**
  * report a message
  * @param {string} message the message
  */
  app.reportMessage = function (message) {
    app.globals.divs.message.innerHTML = message;
  };
  
  /** 
   * add listeners
   */
  app.listeners = function () {
    
    app.globals.divs.selector.addEventListener ("change", function (e) {
      Render.map();
    });
    
  };
  
  return app;

})(App || {});

