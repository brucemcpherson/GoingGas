// content service webapp
function doGet(e) {
  
  // set up defaults
  e = e || {};
  e.parameter = e.parameter || {};
  e.parameter.format = e.parameter.format || "json";
  
  // get the flight data
  var result = getFlight (e);
  var content, 
      mime = e.parameter.callback ? 
        ContentService.MimeType.JAVASCRIPT : ContentService.MimeType.JSON;
  
  // maybe xml is preferred
  if (e.parameter.format.toLowerCase() === "xml") {
    if (e.parameter.callback) {
      result.status = "no callback possible for xml format";
    }
    mime = ContentService.MimeType.XML;
    content = makeXml (result);
  }
  else {
    // need a JSONP wrapper?
    content = e.parameter.callback ? 
          e.parameter.callback + '(' + JSON.stringify(result) + ');' : JSON.stringify(result);

  }
  
  // serve up as contentservice
  return ContentService.createTextOutput(content).setMimeType(mime);

}

/**
 * convert a json object to xml
 * @param {object} json a json object to be converted
 * @param {string} root [root="root"] element name
 * @param {string} xml nicely formatted xml
 */
 
function makeXml (json, root) {
  root = root || "root";
  var rootElement = XmlService.createElement (root);
  
  // add each item in this one level object
  Object.keys(json).forEach (function (d) {
    var child = XmlService.createElement(d);
    child.setText(json[d]);
    rootElement.addContent(child);
  });
  
  // format it
  return XmlService.getPrettyFormat()
          .format(XmlService.createDocument(rootElement));

}
function getFlight(e) {
    
  // get the carrier data
  var lookup = new SheetOb().open(Settings.LOOKUP.ID, Settings.LOOKUP.NAME).getData();
  
  // get the regex based on the interesting airlines
  var rx = new RegExp (getRegex(lookup) ,'gmi');
  
  // match against the known airlines flight codes   
  var found = rx.exec(e.parameter.flight);
          
  // store this message if it's got one
  if (found) {
    return {
      status:"ok",
      flight:found[0],
      carrier:found[1],
      name:lookup.filter(function(d) { 
        return d[Settings.HEADINGS.CODE].toLowerCase() === found[1].toLowerCase();
      })[0][Settings.HEADINGS.NAME]
    };
  }
  else {
    return {
      status:'not found',
      flight:e.parameter.flight
    }
  }
}

/**
* make the regex for flight matching
* @param {object} lookup the lookup data
* @return {Regexp} the matching regex
*/
function getRegex (lookup) {
  
  return '\\b(' +
    lookup.map(function(d) { 
      return d[Settings.HEADINGS.CODE].toLowerCase();
    }).join("|") +
      ')([a-z]?)(\\d{1,4}[a-z]?)\\b';
}

