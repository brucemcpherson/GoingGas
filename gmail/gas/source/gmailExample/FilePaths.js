/**
 * some utilities for dealing with file paths on drive
 */
var FilePaths = (function(filePaths) {
  'use strict';
  
  
  /**
   * given a path like a/b/c.txt
   * extract the folder
   * @param {string} path the path
   * @return {Folder} the driveApp folder 
   */
  filePaths.getDriveFolderFromPath = function (path)  {
    
    return (path || "/").split("/").reduce ( function(prev,current) {
      if (prev && current) {
        var fldrs = prev.getFoldersByName(current);
        return fldrs.hasNext() ? fldrs.next() : null;
      }
      else { 
        return current ? null : prev; 
      }
    },DriveApp.getRootFolder()); 
  
  };
  
 /**
  * given a path like a/b/c.txt
  * extract the folder and return the folder and name
  * @param {string} path the path
  * @return {object} the driveApp folder and file name {folder:..,fileName:..}
  */
  filePaths.splitDrivePath  = function (path) {
    
    // split the name up
    var folderMatch = path.match(/.*\//i);
    var fileMatch = path.match(/[^\/:*?"]*$/i);
    
    // get the folder
    return {
      folder : filePaths.getDriveFolderFromPath(folderMatch ? folderMatch[0] : "/"),
      fileName : fileMatch ? fileMatch[0] : ""
    };
    
  }
  
  return filePaths;

}) (FilePaths || {});


