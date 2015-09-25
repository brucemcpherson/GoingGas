var Settings = (function(settings) {
  'use strict';
  
  // the sheet that holds the look up data
  settings.LOOKUP = {
    ID: '1f4zuZZv2NiLuYSGB5j4ENFc6wEWOmaEdCoHNuv-gHXo',
    NAME: 'lookup'
  };
  
  // the sheet that holds the look up data
  settings.LOG = {
    ID: '1f4zuZZv2NiLuYSGB5j4ENFc6wEWOmaEdCoHNuv-gHXo',
    NAME: 'log',
    HEADINGS: {
      FLIGHT:'flight',
      COUNT:'observations'
    }
  };
  
  // the names of the columns containing the data
  settings.HEADINGS = {
    CODE:'carrier',
    NAME:'name'
  };

  // update the sheet
  return settings;
  
})(Settings || {});

