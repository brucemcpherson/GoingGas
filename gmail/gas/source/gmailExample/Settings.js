// one off settings to get started

var SETTINGS_KEY = "gmailExample";

function setOneTimeProperties () {
  setProperties(oneTimeSettings);
}

function setProperties (props) {
  PropertiesService.getUserProperties().setProperty(oneTimeSettings.KEY, JSON.stringify(props));
}

var oneTimeSettings = (function(settings) {
  'use strict';
  
  settings.KEY = SETTINGS_KEY;
  
  settings.LOOKUP = {
    ID: '19wbpUHwuIKbHaaIiylVSuG7lkK29uoAmYrTvTk_J2ho',
    NAME: 'lookup'
  };
  
  
  settings.THREADS = {
    AFTER:new Date("2015/08/01").toJSON(),
    LABEL:"flight club submissions",
    IN:"inbox",
    PHRASE:'"flight club"'
  };

  
  settings.HEADINGS = {
    CODE:'carrier',
    NAME:'name'
  };
  
  settings.PATHS = {
    ARCHIVE:'/books/going gas/gmailexample/archive/'
  };
  
  settings.COURSES = {
    FLIGHTS: {
      CALENDAR:'course calendar',
      NAME:'"flight club"',
      DELAY:21,
      HORIZON:100
    }
  };
  
  settings.CONTACTS = {
    GROUP:'flight club contacts'
  };
  
  // update the sheet
  return settings;
  
})(oneTimeSettings || {});

// get them from prop service, or use the one time.
var Settings = JSON.parse(PropertiesService.getUserProperties().getProperty(SETTINGS_KEY) || JSON.stringify(oneTimeSettings)) ;