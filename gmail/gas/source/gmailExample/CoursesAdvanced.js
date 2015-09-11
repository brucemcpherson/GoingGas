var CoursesAdvanced = (function(courses) {
  'use strict';
  
  /**
   * get the course calendar
   * @return {Calendar} the calendar
   */
  courses.getCalendar = function () {
    var calendars = CalendarApp.getCalendarsByName(Settings.COURSES.FLIGHTS.CALENDAR);
    if (!calendars || !calendars.length) {
      throw new Error ('could not find course calendar ' + Settings.COURSES.FLIGHTS.CALENDAR);
    }
    return calendars[0];
  };
  
  /**
   * get the next event using the advanced calendar service
   * @return {CalendarEvent} the first matching calendar event
   */
  courses.getNextEvent = function () {
    
    var now = new Date().getTime();
    
    // find the first events for this course
    var events = Utils.rateLimitExpBackoff(function() { 
      return Calendar.Events.list(courses.getCalendar().getId(),{
        q:Settings.COURSES.FLIGHTS.NAME,
        timeMin :new Date(now+Settings.COURSES.FLIGHTS.DELAY*60*60*24*1000).toISOString(),
        timeMax : new Date(now+Settings.COURSES.FLIGHTS.HORIZON*60*60*24*1000).toISOString(),
        singleEvents:true,
        orderBy:'startTime',
        maxResults:1
      });
    });
    
    return events && events.items.length ? events.items[0] : null;
  };

  /**
   * schedule an event using the advanced API
   * @param {Contact} contact the contact  that needs schedulding
   * @return {CalendarEvent} the event
   */
  courses.schedule = function (contact) {
  
    // get next available event
    var nextEvent = courses.getNextEvent();
    if (!nextEvent) throw new Error ('no events set up for course ' + Settings.COURSES.FLIGHTS.NAME);
    
    // get the event
    var event = Utils.rateLimitExpBackoff(function() { 
      return Calendar.Events.get(courses.getCalendar().getId(), nextEvent.id);
    });
    
    // add attendee, creating attendees if none
    if (!event.attendees) {
      event.attendees = [];
    }
    event.attendees.push({email:contact.getEmails()[0].getAddress()});
 
  // patch the event with the new attendees
    return Utils.rateLimitExpBackoff(function() { 
      return Calendar.Events.patch(event, courses.getCalendar().getId(), event.id, {
       sendNotifications: true
      });
    });
   
  };
  

  /**
   * organize courses
   * @param {object[]} messages an array of objects containing contact info
   * @param {CalenderEvents[]} an array of the events invited to
   */
  courses.organizeCourses= function  (messages) {
    
    // this is used to note whether they need a course
    var contactGroup = Contacts.getContactGroup (Settings.CONTACTS.GROUP, true);
    
    return messages.map(function(d) {
      
      // if not in the contact group already , they need a course
      if( !Contacts.isInGroup (contactGroup , d.contact) ) {
        var result = courses.schedule(d.contact);
        contactGroup.addContact (d.contact);
        return result;
      }
      return null;
    })
    
    // get rid of those that didnt get an invite
    .filter (function(d) {
      return d;
    });
    
  };
  
  return courses;
})(CoursesAdvanced || {});

