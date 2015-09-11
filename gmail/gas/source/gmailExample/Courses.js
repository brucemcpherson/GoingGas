
var Courses = (function(courses) {
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
   * get the next course event
   * @return {CalendarEvent} the next available event
   */
  courses.getNextEvent = function () {
    var now = new Date();
    var events = Utils.rateLimitExpBackoff(function() { 
      return courses.getCalendar().getEvents (
        new Date(now.getTime()+Settings.COURSES.FLIGHTS.DELAY*60*60*24*1000),
        new Date(now.getTime()+Settings.COURSES.FLIGHTS.HORIZON*60*60*24*1000),
        {search:Settings.COURSES.FLIGHTS.NAME}
      );
    });
    return events && events.length ? events[0] : null;
  };
  
  /**
   * schedule an event
   * @param {Contact} contact the contact  that needs schedulding
   * @return {CalendarEvent} the event
   */
  courses.schedule = function (contact) {
  
    // get next available event
    var nextEvent = courses.getNextEvent();
    if (!nextEvent) throw new Error ('no events set up for course ' + Settings.COURSES.FLIGHTS.NAME);
    
    // invite the contact to it
    Utils.rateLimitExpBackoff(function() { 
      nextEvent.addGuest(contact.getEmails()[0].getAddress());
    });
    
    return nextEvent;
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
})(Courses || {});


