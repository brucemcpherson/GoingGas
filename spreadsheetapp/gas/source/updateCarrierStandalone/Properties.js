var Properties = (function (properties) {
  
  'use strict';
  
  var APP_NAME = 'carriers';
  /**
   * get the service to use
   * @return {PropertiesService}
   */
  properties.getService = function () {
      return PropertiesService.getUserProperties();
  };
  
  /**
   * get the properties for this app
   * @return {object|null} the properties
   */
  properties.get = function () {
    var prop = properties.getService().getProperty(APP_NAME);
    return prop ? JSON.parse(prop) : null;
  };

  /**
   * set the properties for this app
   * @param {object} props the properties for this app
   * @return {object} the properties
   */
  properties.set = function (props) {
    properties.getService().setProperty(APP_NAME, JSON.stringify(props));
    return props;
  };

  return properties;

})(Properties || {});

