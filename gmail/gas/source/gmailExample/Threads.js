// this interacts with gmail
var Threads = (function(threads) {
  'use strict';
  
  /**
   * get matching threads
   * @return {GmailThread[]} the threads
   */
  threads.get = function () {
  
    return Utils.rateLimitExpBackoff (function () {
      // get all target threads
      return GmailApp.search(Settings.THREADS.PHRASE +
        " after:"+Utilities.formatDate(new Date(Settings.THREADS.AFTER), Session.getScriptTimeZone() , "yyyy/MM/dd") +
        " -label:" + getLabel().getName() + 
        " label:" + Settings.THREADS.IN)
      .filter (function(d) {
        // search only allows searching by date - this filter will further remove using the time too.
        return d.getLastMessageDate().getTime() > new Date(Settings.THREADS.AFTER).getTime();
      });
    });
    
  };

  /**
   * replies
   * @param {object} organized messages to process
   */
  threads.send = function (mobs) {

    // things that need scheduling
    var emailsNeeded = [] ;
    
    // need to send an email confirming
    Object.keys(mobs).forEach (function(k) {
      // each flight within each thread
      Object.keys(mobs[k]).forEach (function(f) {
        
        var m = mobs[k][f].mob;
        var attachments = mobs[k][f].attachments;
        
        // get the name & email address
        var person =  getSplitEmail(m.message.getFrom());
        
        // add them to contacts
        var contact = Contacts.getContact( person.email, true , 
          Utils.getMatchPiece(/(.*)\s/,person.display),
          Utils.getMatchPiece(/\s+(.*)/,person.display));

        // if no attachments its a different workflow
        if (attachments && attachments.length ) {
        
          // if its a new person, they wont have a folder yet
          var personFolder = FilePaths.getDriveFolderFromPath(Settings.PATHS.ARCHIVE + person.display);
          
          // do the workflow for a new person
          if(!personFolder) {
            var archiveFolder = FilePaths.getDriveFolderFromPath(Settings.PATHS.ARCHIVE);
            if (!archiveFolder) {
              throw new Error ('archive folder ' + Settings.PATHS.ARCHIVE + ' missing - please create it or change settings');
            }
            
            // create a folder and allow them to view it
            var personFolder = archiveFolder.createFolder(person.display);
            personFolder.addViewer (person.email);
          }
  
          // need to create a flight number folder if not existing
          var flightFolder = 
            FilePaths.getDriveFolderFromPath(
              Settings.PATHS.ARCHIVE + person.display + "/" + m.flightNumber) ||
            personFolder.createFolder (m.flightNumber);

          // save them to drive and get their file objects
          var files = attachments.map(function(d) {
            return Utils.rateLimitExpBackoff(function() {
                return flightFolder.createFile(d);
            }); 
          });

          emailsNeeded.push ({mob:m, person:person, files:files, folder:flightFolder,contact:contact});        
        }
        else {
          // no attachments - still need an email to ask for one
          emailsNeeded.push ({mob:m, person:person,contact:contact});
        }

      });
    });

    // now deal with scheduled courses
    CoursesAdvanced.organizeCourses(emailsNeeded);
    
    // and with emails to be sent - first organize for only 1 consolidated email per person
    sendEmails (emailsNeeded) ;

   };
  
   /**
    * send emails after first summarizing them by unique individual
    * @param {object[]} emailsNeeded
    */
    function sendEmails (emailsNeeded) {
    
       // reduce to one item per person
       var organize = emailsNeeded.reduce(function(p,c) {
        // create an item indexed by contact
        var id = c.contact.getId();
        p[id] = p[id] || [];
        p[id].push(c);
        return p;
      },{});
      

      // then send
      Object.keys(organize).forEach(function(k) {
          var ob = organize[k];

          // each message received for one person
          var htmlBody = ob.reduce (function(p,c) {
          
            p += c.files ?
             '<p>You uploaded the following files for ' + c.mob.name + ' flight ' + c.mob.flightNumber + '</p>' + 
              '<table><tr><th>Name</th><th>Folder</th></tr>' +
               c.files.map(function(d) {
             
                  return '<tr>' + 
                  '<td><a href="' + d.getUrl() + '">' + d.getName() + '</td>' +
                  '<td><a href="' + c.folder.getUrl() + '">' + c.folder.getName() + '</td>'
                })
                .join('</tr>') + '</table>' :
                 '<p>For ' + c.mob.name + ' flight ' + c.mob.flightNumber + 
                 'there were no files attached. Please resubmit, this time with the expected attachments</p>';
          
            return p;
          },'<h4>Dear ' + ob[0].person.display + '</h4>' + '<p>Thank you for your flight data submission<br></p>');
          
          // send the mail
          Utils.rateLimitExpBackoff(function() {
            GmailApp.sendEmail( ob[0].person.email, 
              'your flight data submission','Thank you for your flight data submission. Please view this email on an HTML enabled device',{
              htmlBody:htmlBody,
              noReply:true
            });
          });
          
      });
      
      //mark all as processed
      emailsNeeded.forEach(function(e) {
          e.mob.message.getThread().addLabel(getLabel());
          e.mob.message.star();
      });
    }
    
    /**
    * get the from email & display name from a fom field in Gmail app
    * @param {string} from the getFrom() data
    * @return {object} an object with email and display properties
    */
    function getSplitEmail (from,def) {
      
      // the email address from gmailapp contains mixed email and display name - this will split them
      return { 
        email: Utils.getMatchPiece (/\<(.*)\>/ , from,'') , 
        display: Utils.getMatchPiece (/(.*)\s+\</, from,'') 
      };     
      
    }
    
  /**
  * get a labels
  * @return {GmailLabel} the label
  */
  function getLabel () {
    var label = GmailApp.getUserLabelByName(Settings.THREADS.LABEL);
    return label || GmailApp.createLabel(Settings.THREADS.LABEL);
  }
  
  return threads;
  
})(Threads || {});