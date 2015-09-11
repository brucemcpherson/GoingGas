// Handle fusion
var Fusion = (function (fusion) {

  /**
   * find all tables match name
   * @param {string} name the table name
   * @return {[object]} the tableId & name of tables that match
   */
  fusion.findByName = function (name) {
    
    var tables = Utils.rateLimitExpBackoff(function() {
      return FusionTables.Table.list({fields:"items(name,tableId)"});
    });
    
    // find the right one(s)
    return tables.items.filter(function(d) {
      return d.name === name;
    });
  };
  
  /**
   * do a query
   * @param {string} id the table id
   * @param {string} optSql the string after WHERE
   * @return {object} the result
   */
  fusion.query = function (id, where) {
    return Utils.rateLimitExpBackoff(function() {
      return FusionTables.Query.sqlGet("SELECT * FROM " + id + (where ? " WHERE " + where : ''));
    });
  };
  /**
   * remove all the rows in a table
   * @param {string} id the table id
   * @return {object} the result
   */
  fusion.clearData = function (id) {

   return Utils.rateLimitExpBackoff(function() {
     return FusionTables.Query.sql("DELETE FROM " + id);
   });

  };
  
  /**
   * insert data into a table
   * @param {string} id the table id
   * @param {SheetOb} sob the sheet object to insert
   * @return {Fusion} self
   */
  fusion.insertRows = function (id,sob) {

    // generate a bunch of insert statements
    var inserts = sob.getData().map(function(d) {
      return 'INSERT INTO ' + id + 
        ' (' + Object.keys(d).map(function(e) { return quote_(e); }).join(',') + ') ' + 
          ' VALUES (' + Object.keys(d).map(function(e) { return quote_(d[e]); }).join(',') + ')';
    });
    
    // max quotas on the size of insert tables (500 lines, 1mb , 10000 cells)
    var MAX_CHUNKSIZE = 1024*1000, 
      MAX_INSERTS = Math.min(500, Math.floor(10000 / Object.keys(sob.getHeaderOb()).length)); 
        
    // create arrays of chunks of inserts sizes that dont break any rules.
    var toWrite = inserts.reduce (function (p,c) {
      if ( p.chunkSize + c.length > MAX_CHUNKSIZE || p.chunks.length >= MAX_INSERTS-1) {
        p.inserts.push (p.chunks);
        p.chunks = [];
        p.chunkSize = 0;
      }
      p.chunks.push(c);
      p.chunkSize += c.length;
      return p;
    }, {chunks:[],chunkSize:0, inserts:[] });
    
    // now do the inserts
    if (toWrite.chunks.length) toWrite.inserts.push (toWrite.chunks);
    toWrite.inserts.forEach (function(d) {
      return Utils.rateLimitExpBackoff(function() {
        return FusionTables.Query.sql(d.join(';') + ';');
      });
    });

  };
  

  function quote_ (value) {
    return typeof value !== 'number' ? "'" + value.toString() + "'" : value;
  }

  /**
   * create table of a given name
   * @param {string} name the table name
   * @param {SheetOb} sob the sheetobject
   */
  fusion.createTable = function (name,sob) {
    
    // this needs some more work to generalize type detection.
    // for this example its fine as it should support string or number
    var columns = Object.keys(sob.getHeaderOb()).map (function(d) {
      return {
        name:d,
        type:sob.getData().reduce(function(p,c) {
          return p && p !== c[d] ? "STRING" : typeof c[d];
        }).toUpperCase() || "STRING"  
      }
    });
    
    // set the column types
    var payload = {
      name:name,
      isExportable: true,
      columns:columns
    }
    
    // create the table
    return Utils.rateLimitExpBackoff(function() {    
      return FusionTables.Table.insert(payload);
    });

  };
  
  return fusion;
  
})(Fusion || {});
