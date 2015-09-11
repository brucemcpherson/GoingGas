/**
 * create a filesystem object like the scripting.filesystemobject in windows
 * @constructor FileSystemObject
 * @param {driveApp} driveApp the driveapp service handle
 * @return {FileSystemObject} self
 */
function FileSystemObject (driveApp) {

  // the hosting script should pass the driveApp service
  // this avoids unnecessary authorization of the libraryif its not used
  var driveApp_ = driveApp;
  
  var self = this;
  
  /**
   * check to see if a file exists - the path can include folder name - then get the file iterator
   * @param {string} path the path
   * @return {Iterator} a driveapp file iterator
   */
  self.fileGet = function  (path) {
  
    //  get the folder  and the file name
    var pathOb = splitDrivePath (path);

    // get the file
    return pathOb.folder ? pathOb.folder.getFilesByName(pathOb.fileName) : null;
  
  };
  
  /**
   * check to see if a file exists - the path can include folder name
   * @param {string} path the path
   * @return {boolean} whether it exits
   */
  self.fileExists = function (path) {
  
    // get the files
    var iterator  = self.fileGet (path);
  
    // check if there were any
    return iterator ? iterator.hasNext() : false;

  };

  /**
   * read content of a Drive file as a string given the path
   * @param {string} path the path
   * @return {string} the content
   */
  self.fileRead = function (path ) {
  
    // see if the file exists and return its contents
    var iterator  = self.fileGet (path);
    
    // check if there were any
    return iterator && iterator.hasNext() ? iterator.next().getBlob().getDataAsString() : "";
       
  };
  
  /**
   * write content to a file - the path can include folder name - then get the file iterator
   * normally we would set a Mime Type, but since this from VBA porting, Im leaving it blank for now
   * @param {string} path the path
   * @param {string} content the content
   * @param {MimeType} [mimeType] a drive mimetype
   * @return {File} a driveapp file 
   */
  self.fileWrite = function (path, content, mimeType ) {
      
    // see if the file exists
    var files = self.fileGet(path);
    
    // if it doesnt, need to create it
    if (files.hasNext()) {
      var file = files.next();
      file.setContent(content);
    }
    else {
      var pathOb = splitDrivePath (path);
      var file = pathOb.folder.createFile(pathOb.fileName,content,mimeType);
    }
    
    return file;
  }
  
  /**
  * given a path like a/b/c.txt
  * extract the folder and return the folder and name
  * @param {string} path the path
  * @return {object} the driveApp folder and file name {folder:..,fileName:..}
  */
  function splitDrivePath (path) {
    
    // split the name up
    var folderMatch = path.match(/.*\//i);
    var fileMatch = path.match(/[^\/:*?"]*$/i);
    
    // get the folder
    return {
      folder : getDriveFolderFromPath(folderMatch ? folderMatch[0] : "/"),
      fileName : fileMatch ? fileMatch[0] : ""
    };
    
  }
 
  /**
   * given a path like a/b/c.txt
   * extract the folder
   * @param {string} path the path
   * @return {Folder} the driveApp folder 
   */
  function getDriveFolderFromPath (path)  {
    
    return (path || "/").split("/").reduce ( function(prev,current) {
      if (prev && current) {
        var fldrs = prev.getFoldersByName(current);
        return fldrs.hasNext() ? fldrs.next() : null;
      }
      else { 
        return current ? null : prev; 
      }
    },driveApp_.getRootFolder()); 
  
  }
  
  return self;
}    
