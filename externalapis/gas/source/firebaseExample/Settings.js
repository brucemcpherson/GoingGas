// one off settings to get started

var SETTINGS_KEY = "firebaseexample";

function setOneTimeProperties () {
  setProperties(oneTimeSettings);
}

function setProperties (props) {
  PropertiesService.getUserProperties().setProperty(SETTINGS_KEY, JSON.stringify(props));
}

var oneTimeSettings = (function(settings) {
  'use strict';
  
  settings.KEY = SETTINGS_KEY;
  
  settings.LOOKUP = {
    ID: '1f4zuZZv2NiLuYSGB5j4ENFc6wEWOmaEdCoHNuv-gHXo',
    NAME: 'lookup'
  };
  
  settings.HEADINGS = {
    CODE:'carrier',
    NAME:'name'
  };

  settings.FIREBASE = {
    SECRET:'EIk6x9iIY61iSPYg2aKrooI8oSnR78gh64cR3nOd',
    ROOT:'https://fiery-inferno-4685.firebaseio.com/carriers',
    AUTH:{uid:"bruce"}
  };
  
  // update the sheet
  return settings;
  
})(oneTimeSettings || {});

// get them from prop service, or use the one time.
var Settings = JSON.parse(PropertiesService.getUserProperties().getProperty(SETTINGS_KEY))  ;