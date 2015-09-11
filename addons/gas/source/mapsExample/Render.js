
/**
 * anything to do with rendering happens here
 */
 var Render = (function (render) {
  
   
   /**
    * render a map
    */
   render.map = function() {
   
     // do we need a new map?
     if (!App.globals.map.ob) {
       render.newMap();
     }
     var bounds = new google.maps.LatLngBounds();
     
     // clear previous markers
     App.globals.map.markers.forEach(function(d) {
       d.setMap(null);
     });
     App.globals.map.markers = [];
     
     // add points for active region
     var selectedregion = App.globals.divs.selector.value;
     
     //shortcut
     var props = App.globals.propertyNames;
      
     App.globals.sheet.package.data.filter(function(d) {
       return d[props.region] === selectedregion;
     })
     .forEach (function (d) {
       // convert from degress.mins.secs
       var position = new google.maps.LatLng(d[props.arplat],d[props.arplon]);
       
       if (position) {

         // create a marker
         var marker = new google.maps.Marker({
           position: position,
           map:App.globals.map.ob,
           title:d[props.title]
         });

         // create a popup infowindow
        
         
         var infoWindow = new google.maps.InfoWindow({
          content: '<div>' + 
            '<h1>' + d[props.title] + '</h1>' + 
            '<table>' + 
            '<tr><td>Iata</td><td>' + d[props.iata] + '</td></tr>' +
            '<tr><td>Country</td><td>' + countryText_(d[props.country]) + '</td></tr>' +
            '<tr><td>Region</td><td>' + d[props.region] + '</td></tr>' +
            '<tr><td>Municipality </td><td>' + d[props.municipality] + '</td></tr>' +
            '<tr><td>Elevation</td><td>' + d[props.elevation] + '</td></tr>' +
            '</table></div>'
        });
  
         // add an event to the marker
         marker.addListener('click', function() {
          infoWindow.open(App.globals.map.ob, marker);
         });
         
         // listen for the infowindow being closed, so map can be recentered
         google.maps.event.addListener(infoWindow,'closeclick',function(){
           infoWindow.close();
           App.globals.map.ob.fitBounds(bounds); 
         });
         
         // resize the map
         bounds.extend(position);
         
         //remember the marker for later
         App.globals.map.markers.push(marker);
         
       }
     });
     
     // readjust the map size
     App.globals.map.ob.fitBounds(bounds);
   
    
   };
   
   /**
    * make new map
    */
   render.newMap = function() {
     // create a map
     App.globals.map.ob = new google.maps.Map(App.globals.divs.mapCanvas, App.globals.map.options);        
   };  
   
   
   render.selectionChanged = function (position) {
     
     // if the default has changed, then redo
     var currentRow = Math.max(0,position.row-2);
     
     var defaultRegion = 
        App.globals.sheet.package.data[currentRow][App.globals.propertyNames.region];
     
     // the select element
     if (defaultRegion === App.globals.divs.selector.value) return false;
     
     // its changed
     for (var i=0; i < App.globals.divs.selector.options.length; i++) {
       App.globals.divs.selector.options[i].selected = 
         App.globals.divs.selector.options[i].value === defaultRegion;
     }
     
     // update the map
     render.map();
     
     return true;

     
   }
   /**
    * build selector
    */
    render.build = function () {
      
      // but can't do until the countries api is executed
      if (!App.globals.countries.executed) {
          setTimeout(function(){ 
            render.build();
        }, App.globals.countries.interval);
      }
      else {
      
        // the select element is already in place
        var props = App.globals.propertyNames;
  
        // add the options, but first reduce to one per region
        App.globals.sheet.package.data.filter(function(d,i,a) {
          return indexOfProps_ (a, props.region, d[props.region] ) === i;
        })
        .sort(function (a,b) {
          return a[props.region] > b[props.region] ? 1 : 
            ( a[props.region] === b[props.region] ? 0 : -1 );
        })
        .forEach (function (d) {
            App.globals.divs.selector.appendChild(
              new Option ( countryText_ (d[props.country]) + ' (' + 
                d[props.region] + ')', d[props.region] ));
        });
        
        // set the default
        render.selectionChanged(App.globals.sheet.position);
      }
    };

    function countryText_  (code) {
      return App.globals.countries.lookup && App.globals.countries.lookup[code.toLowerCase()] ? 
        App.globals.countries.lookup[code.toLowerCase()].name : code;
    }
    /**
     * a kind of indexof, but with property
     * @param {[*]} obs an array of objects
     * @param {string} property name to check
     * @param {*} value the value to check against
     * @return {number} the index of the first occurrence
     */
     function indexOfProps_ (obs , property, value) {
     
       for (var p =0 ; p < obs.length ; p++ ) {
         if (obs[p][property] ===  value) return p;
       }
       return -1;
     }
     
   return render;
 })(Render || {});
 
