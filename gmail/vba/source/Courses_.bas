Attribute VB_Name = "Courses_"
Option Explicit
'  /**
'   * get the course calendar
'   * @return {Calendar} the calendar
'   */
Public Function getCalendar() As folder
    Set getCalendar = Session.GetDefaultFolder(olFolderCalendar). _
        Folders(Settings.getValue("COURSES.flights.CALENDAR"))
End Function

'  /**
'   * get the next event using the advanced calendar service
'   * @return {CalendarEvent} the first matching calendar event
'   */
Public Function getNextEvent() As AppointmentItem
    Dim dateNow As Date, timeMin As Date, timeMax As Date, _
        restriction As String, events As items, _
        possibleEvents As items, e As AppointmentItem
    
    dateNow = now
    
    ' get all the events
    Set events = getCalendar().items
    events.IncludeRecurrences = True
    
    timeMin = DateAdd("d", dateNow, Settings.getValue("COURSES.FLIGHTS.DELAY"))
    timeMax = DateAdd("d", dateNow, Settings.getValue("COURSES.FLIGHTS.HORIZON"))
    
    ' set time filter
    restriction = "[Start] >= '" & _
        Format$(timeMin, "mm/dd/yyyy hh:mm AMPM") _
        & "' AND [End] <= '" & _
        Format$(timeMax, "mm/dd/yyyy hh:mm AMPM") & "'"

    ' apply filter and sort
    Set possibleEvents = events.Restrict(restriction)
    possibleEvents.Sort "[Start]"
    
    For Each e In possibleEvents
        ' filter on subject
        If (InStr(1, e.Subject, Settings.getValue("COURSES.FLIGHTS.NAME")) > 0) Then
            Set getNextEvent = e
            Exit Function
        End If
    Next e
    
End Function

'  /**
'   * schedule an event
'   * @param {Contact} contact the contact  that needs schedulding
'   * @return {CalendarEvent} the event
'   */
Public Function schedule(contact As ContactItem) As AppointmentItem
    Dim nextEvent As AppointmentItem
    
    ' get the next suitable event
    Set nextEvent = getNextEvent
    Debug.Assert Not nextEvent Is Nothing
    
    ' add attendees
    nextEvent.Recipients.add contact.Email1Address
    
    ' send invite
    nextEvent.send
    
    Set schedule = nextEvent
End Function

'  /**
'   * organize courses
'   * @param {object[]} messages an array of objects containing contact info

'   * @param {CalenderEvents[]} an array of the events invited to
'   */
Public Function organizeCourses(messages As Collection) As Collection
    Dim kv As KVPairs, contactGroup As DistListItem, _
        result As AppointmentItem, invitees As Collection, _
        mailMessage As mailItem
        
    Set invitees = New Collection
    
    ' get the contact group or create it
    Set contactGroup = Contacts_.getContactGroup(Settings.getValue("COURSES.CONTACTS.GROUP"), True)

    ' see what emails need sent
    For Each kv In messages
        ' if not in contact group then need a course
        If (Not Contacts_.isInGroup(contactGroup, kv.getValue("contact"))) Then
            Set result = schedule(kv.getValue("contact"))
            Set mailMessage = kv.getValue("mob").getValue("message")
            contactGroup.AddMember (mailMessage.Recipients(1))
            invitees.add kv
        End If
    Next kv
    Set organizeCourses = invitees

End Function
'
'    // this is used to note whether they need a course
'    var contactGroup = Contacts.getContactGroup (Settings.CONTACTS.GROUP, true);
'
'    return messages.map(function(d) {
'
'      // if not in the contact group already , they need a course
'      if( !Contacts.isInGroup (contactGroup , d.contact) ) {
'        var result = courses.schedule(d.contact);
'        contactGroup.addContact (d.contact);
'        return result;
'      }
'      return null;
'    })
'
'    // get rid of those that didnt get an invite
'    .filter (function(d) {
'      return d;
'    });
'
'  };
'
'    // get next available event
'    var nextEvent = courses.getNextEvent();
'    if (!nextEvent) throw new Error ('no events set up for course ' + Settings.COURSES.FLIGHTS.NAME);
'
'    // get the event
'    var event = Utils.rateLimitExpBackoff(function() {
'      return Calendar.Events.get(courses.getCalendar().getId(), nextEvent.id);
'    });
'
'    // add attendee, creating attendees if none
'    if (!event.attendees) {
'      event.attendees = [];
'    }
'    event.attendees.push({email:contact.getEmails()[0].getAddress()});
'
'  // patch the event with the new attendees
'    return Utils.rateLimitExpBackoff(function() {
'      return Calendar.Events.patch(event, courses.getCalendar().getId(), event.id, {
'       sendNotifications: true
'      });
'    });
'
'  };
'

'  courses.getNextEvent = function () {
'
'    var now = new Date().getTime();
'
'    // find the first events for this course
'    var events = Utils.rateLimitExpBackoff(function() {
'      return Calendar.Events.list(courses.getCalendar().getId(),{
'        q:Settings.COURSES.FLIGHTS.NAME,
'        timeMin :new Date(now+Settings.COURSES.FLIGHTS.DELAY*60*60*24*1000).toISOString(),
'        timeMax : new Date(now+Settings.COURSES.FLIGHTS.HORIZON*60*60*24*1000).toISOString(),
'        singleEvents:true,
'orderBy:        'startTime',
'        maxResults:1
'      });
'    });
'
'    return events && events.items.length ? events.items[0] : null;
'  };

'var CoursesAdvanced = (function(courses) {
'  'use strict';
'
'  /**
'   * get the course calendar
'   * @return {Calendar} the calendar
'   */
'  courses.getCalendar = function () {
'    var calendars = CalendarApp.getCalendarsByName(Settings.COURSES.FLIGHTS.CALENDAR);
'    if (!calendars || !calendars.length) {
'      throw new Error ('could not find course calendar ' + Settings.COURSES.FLIGHTS.CALENDAR);
'    }
'    return calendars[0];
'  };
'
'  /**
'   * get the next event using the advanced calendar service
'   * @return {CalendarEvent} the first matching calendar event
'   */
'  courses.getNextEvent = function () {
'
'    var now = new Date().getTime();
'
'    // find the first events for this course
'    var events = Utils.rateLimitExpBackoff(function() {
'      return Calendar.Events.list(courses.getCalendar().getId(),{
'        q:Settings.COURSES.FLIGHTS.NAME,
'        timeMin :new Date(now+Settings.COURSES.FLIGHTS.DELAY*60*60*24*1000).toISOString(),
'        timeMax : new Date(now+Settings.COURSES.FLIGHTS.HORIZON*60*60*24*1000).toISOString(),
'        singleEvents:true,
'orderBy:        'startTime',
'        maxResults:1
'      });
'    });
'
'    return events && events.items.length ? events.items[0] : null;
'  };
'
'  /**
'   * schedule an event using the advanced API
'   * @param {Contact} contact the contact  that needs schedulding
'   * @return {CalendarEvent} the event
'   */
'  courses.schedule = function (contact) {
'
'    // get next available event
'    var nextEvent = courses.getNextEvent();
'    if (!nextEvent) throw new Error ('no events set up for course ' + Settings.COURSES.FLIGHTS.NAME);
'
'    // get the event
'    var event = Utils.rateLimitExpBackoff(function() {
'      return Calendar.Events.get(courses.getCalendar().getId(), nextEvent.id);
'    });
'
'    // add attendee, creating attendees if none
'    if (!event.attendees) {
'      event.attendees = [];
'    }
'    event.attendees.push({email:contact.getEmails()[0].getAddress()});
'
'  // patch the event with the new attendees
'    return Utils.rateLimitExpBackoff(function() {
'      return Calendar.Events.patch(event, courses.getCalendar().getId(), event.id, {
'       sendNotifications: true
'      });
'    });
'
'  };
'
'
'  /**
'   * organize courses
'   * @param {object[]} messages an array of objects containing contact info
'   * @param {CalenderEvents[]} an array of the events invited to
'   */
'  courses.organizeCourses= function  (messages) {
'
'    // this is used to note whether they need a course
'    var contactGroup = Contacts.getContactGroup (Settings.CONTACTS.GROUP, true);
'
'    return messages.map(function(d) {
'
'      // if not in the contact group already , they need a course
'      if( !Contacts.isInGroup (contactGroup , d.contact) ) {
'        var result = courses.schedule(d.contact);
'        contactGroup.addContact (d.contact);
'        return result;
'      }
'      return null;
'    })
'
'    // get rid of those that didnt get an invite
'    .filter (function(d) {
'      return d;
'    });
'
'  };
'
'  return courses;
'})(CoursesAdvanced || {});


