var Match = (function(match) {
  'use strict';
  
  // These are non threatening errors from GMAIL we'll just ignore.
  var okErrors = [
    'Attachment content not recognized as string or binary.',
    'Invalid mime type'
  ];
            
  /**
   * filter the threads based on wteher they have any likely flight numbers
   * @param {GmailThread[]} the threads
   * @return {object[]} the filtered messages
   */
  match.messages = function (threads, lookup) {
  
    // get the regex for the allowable airlines
    var rx = new RegExp (getRegex(lookup) ,'gmi');
   
    // look at all the messages in all the threads
    return threads.reduce (function (p,c) {

      // get the messages with any flight stuff in them
      Utils.rateLimitExpBackoff (function () {
        return c.getMessages();
      })
      
      // only look at individual messages since the last time this was run
      .filter(function(m) {
        return m.getDate().getTime() > new Date(Settings.THREADS.AFTER).getTime() && !m.isStarred();
      })
      
      // process the content
      .forEach (function (m) {
        
        try  {
          // get the message content
          var content = Utils.rateLimitExpBackoff (function () {
            return m.getPlainBody();
          });
          
          // see if there's a flight number here somewhere
          var found =  content ? (rx.exec(content) || rx.exec(m.getSubject())) : false ;
          
          // store this message if it's got one
          if (found) {
            
            p.push({
              flightNumber:found[0],
              message:m,
              carrier:found[1],
              name:lookup.filter(function(d){ 
                return d[Settings.HEADINGS.CODE].toLowerCase() === found[1].toLowerCase();
              })[0][Settings.HEADINGS.NAME]
            });
           
          }
        }
        
        catch (err) {
          
          // ignore the usual suspects
          if (okErrors.some (function (e) {
            return err.message.slice(0,e.length) !== e;
          })) throw new Error (err);

        }
 
      });
      return p; 
      
    },[]);
   
   
  };
  
  /**
   * organize the messages into threads/messages/flightnumbers giving priority to attachments
   * @param {object[]} the filtered messages
   * @return {object} the organized messages
   */
  match.organize = function (mobs) {
  
  // want messages to be reduced to one per thread per flight number, with attachments given priority
  // this is a little complex since there might be multiple messages for multiple flights in a thread
    return mobs.reduce (function(p,c) {
        
        // the message thread
        var threadId = c.message.getThread().getId();
        p[threadId] = p[threadId] || {};

        // the flight
        p[threadId][c.flightNumber] = p[threadId][c.flightNumber] || {};
        var ob = p[threadId][c.flightNumber];
        
        // mails with attachments get priority
        var attachments = Utils.rateLimitExpBackoff( function () {
          return c.message.getAttachments();
        });
        
        if ( (attachments && attachments.length) || 
              (!ob.attachments || !ob.attachments.length) ) {
          ob.attachments = attachments;
          ob.mob = c;
        }
  
        return p;
    },{});
  
  };
  
  /**
   * make the regex for flight matching
   * @param {object} lookup the lookup data
   * @return {Regexp} the matching regex
   */
   function getRegex (lookup) {
   
      // according to wikipedia, https://en.wikipedia.org/wiki/Airline_codes
      // a flight number looks like this
      // - xx(a)n(n)(n)(n)(a)
      // xx = the airline code
      // n - between 1 and 3 numberic codes
      // a - an operational optional code
   
     return '\\b(' +
         lookup.map(function(d) { 
         return d[Settings.HEADINGS.CODE].toLowerCase();
       }).join("|") +
       ')([a-z]?)(\\d{1,4}[a-z]?)\\b';
   }
   

  return match;
})(Match || {});
