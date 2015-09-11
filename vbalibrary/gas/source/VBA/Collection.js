/**
 * simulate a VBA collection
 * naming case conventions as per VBA 
 * indices start at 1 
 * @constructor Collection
 * @return {Collection} self
 */
function Collection(theItem) {

  var self = this;
      
  /**
   * add an item to a collection
   * @param {*} item an item to add to a collection
   * @param {string} [key] the key to retrieve it by later
   * @param {string} [before] the index to insert the item before (starting 1)
   * @param {string} [after] the index to insert the item after (starting 1)
   * @return {*} the item
   */
  self.Add = function (item , key , before , after) {
    
    // check any given args are valid
    if(key && !isUndefined(collectionKeys_[key]) ) {
        throw key + ' already in collection';
    }
    
    // before and after validity checks
    if (!isUndefined(before) && (before > collection_.length || before < 1)) {
      throw before + ' before index is invalid ';
    }
    
    if (!isUndefined(after) && (after > collection_.length || after < 1)) {
      throw after + ' after index is invalid ';
    }
    
    // find position to be inserted at
    var pos = before ? before-1 : ( after || collection_.length );

    // shuffle up keys
    if (pos < collection_.length) { 

      Object.keys(collectionKeys_).forEach (function (k) {
        if (collectionKeys_[k] >= pos) collectionKeys_[k]++;
      });
    }
        
    // insert the item
    collection_.splice(pos,0,item);

    
    // add the key
    if (key)collectionKeys_[key.toString()] = pos;
    
    // for chaining
    return item;
    
  };
  
  /**
   * number of items in the collection
   * @return {number} the count
   */
  self.Count = function () {
    return collection_.length;
  };
  
  /**
   * get an item from a collection
   * @param {string|number} [key] either a key or a numeric index
   * @return {object} the item, index and key
   */
  function getItem_ (key) {

    var index = typeof key === 'number' ? key -1  : collectionKeys_[key];
    
    return { 
      item: collection_[index],
      index: index,
      key: key
    };

  }
 
  /**
   * throw an error if item wasnt found
   * @param {object} ob returned from getItem_
   * @return {object} the object
   */ 
  function assertKey_ (ob) {
    if (isUndefined(ob.item)) {
      throw 'key ' + ob.key + ' not in collection';
    }
    return ob;
  }
  
  /**
   * get an item from a collection
   * @param {string|number} [key] either a key or a numeric index
   * @return {*} the item
   */
  self.Item = function (key) {
    return assertKey_ (getItem_ (key)).item;
  };
  
  /**
   * remove an item from a collection
   * @param {string|number} [key] either a key or a numeric index
   * @return {*} the removed item
   */
  self.Remove = function (key) {
    var ob = assertKey_ (getItem_ (key)); 
    
    // shuffle down
    Object.keys(collectionKeys_).forEach (function (k) {
      if (collectionKeys_[k] > ob.index) collectionKeys_[k]--;
    });
    
    // delete the item's key
    if (!isUndefined(ob.key)) delete collectionKeys_[ob.key];
    
    // and the item from the array
    return collection_.splice(ob.index,1)[0];
    
  };
  
  /**
   * a lamda to iterate
   * @param {function} func the iteration function
   * @return void
   */
  self.forEach = function (func) {
  
    collection_.forEach ( function (d,i,a) {
      return func(d , i , a) ;
    });
    
  }; 

  // the private data structures
  var collection_ = [];
  var collectionKeys_ = {};

  
  return self;
}
