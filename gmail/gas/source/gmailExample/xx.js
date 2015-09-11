function yy() {
  var redBox = {};
  redBox.color = 0xFF0000;
  redBox.width = 200;
  redBox.height = 100;
  redBox.name = "red box";
  
  var yellowBox = {
    color:0xffff00,
    width:200,
    height:100,
    name:"Yellow box"
  };
  showBox (yellowBox);
  
  var blueBox = JSON.parse(JSON.stringify(redBox));
  blueBox.color = 0xFF;
  blueBox.name = "blue box";
  showBox (blueBox);
  showBox (redBox); 
  showBox (yellowBox);
}

function showBox(theBox) {
  Logger.log(theBox);
}
  
function myFunction() {
  //Logger.log(CalendarApp.getAllCalendars().map(function(calendar) {
  //  return calendar.getId() + calendar.getName();
  //}));
  
  var now = new Date().getTime();
  
  // get the course calendar
  var calendar = Courses.getCalendar();

  // find any events for this course
  var eventList = Calendar.Events.list(calendar.getId(),{
    q:Settings.COURSES.FLIGHTS.NAME,
    timeMin :new Date(now+Settings.COURSES.FLIGHTS.DELAY*60*60*24*1000).toISOString(),
    timeMax : new Date(now+Settings.COURSES.FLIGHTS.HORIZON*60*60*24*1000).toISOString(),
    singleEvents:true,
    orderBy:'startTime',
    maxResults:1
  });
   
   
  
  // check there was a course available
  if (!eventList.items.length) throw new Error ('No courses available');
  
  // get the event
  var event = Calendar.Events.get(calendar.getId(), eventList.items[0].id);
  
  // add attendee, creating attendees if none
  if (!event.attendees) {
    event.attendees = [];
  }
  event.attendees.push({email:'test@mcpher.com'});
 
  // patch the event with the new attendees
  event = Calendar.Events.patch(event, calendar.getId(), event.id, {
   sendNotifications: true
  });


  Logger.log(JSON.stringify(event));
  
  
  //var event = Courses.getNextEvent();
  
  //var eventResource = Calendar.Events.get(calendar.getId(), Utils.getMatchPiece(/(.*)\@/,event.getId()));
  
  //Logger.log(JSON.stringify(eventResource));
  /*
  var event = Calendar.Events.get(calendar.getId(), eventId, optionalArgs)eventList.items[0];
  Logger.log(JSON.stringify(event));
  event.attendees.push({email:'bruce.mcpherson@gmail.com'});
  Calendar.Events.update(event, calendar.getId(), event.id ,{sendUpdates:true});
  
*/
}

