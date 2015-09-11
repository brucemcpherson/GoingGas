/**
 * create a structured table from a range of data
 * @constructor ListObject
 * @param {Range} range the data range
 * @param {string} [name] the table name
 * @param {boolean} [hasHeaders=true] whether the table has headers
 * @return {ListObject} self
 */
function ListObject (range , name , hasHeaders) {
  
  var self = this;
  hasHeaders_ = fixOptional (hasHeaders , true);
  
  // get the data from the range
  var range_ = range;
  var data_ = range_.getValues();
  
  // generate a unique name for the table if none given
  var name_ = name || 'table_'+new Date().getTime().toString(16);
  
  // get the header row
  var headers_ = hasHeaders_ ? data_.shift() : null;
  
  // get the header collection (using the VBA collection object)
  var numCols_ = range_.getNumColumns();
  self.ListColumns = new Collection();
  self.ListRows = new Collection();
  
  function reCalculate_ () {
  
    self.DataBodyRange = range_.offset(hasHeaders_ ? 1 : 0, 0,  data_.length, numCols_) ;
    self.HeaderRowRange = hasHeaders_ ? range_.offset( 0, 0,  1, numCols_) : null ;
  
    
    for (var i=0; i < numCols_ ; i++) {
      self.ListColumns.Add ( {
        Index:i+1 , 
        Name:hasHeaders_ ? headers_[i] : 'Column'+(i+1).toFixed(0),
        Range:hasHeaders_ ? self.HeaderRowRange.offset(0,i,1,1) : null,
        DataBodyRange:self.DataBodyRange.offset(0,i,data_.length,1)
      }, hasHeaders_ ? headers_[i] : 'Column'+(i+1).toFixed(0) );
    }

    data_.forEach(function (d,i) {
      self.ListRows.Add ( {
        Index:i+1, 
        Range:self.DataBodyRange.offset(i,0,1,numCols_)
      });
    });
  }
  
  reCalculate_();
  
  return self;
}