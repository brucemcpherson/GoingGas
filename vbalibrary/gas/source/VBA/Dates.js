var SECMS = 1000;
var DAYMS = SECMS * 60 * 60 * 24; //( a day in milliseconds)
var HOURMS = DAYMS/24;
var MINMS = HOURMS/60;


/**
 * Now - VBA equivalent - Returns the date and time now
 * @return {Date} the date object now
 */
 function Now () {
   return new Date();
 }
 
/**
 * DateNow - VBA equivalent - Returns the date part of now
 * @return {Date} the date object now
 */
 function DateNow () {
   return DateValue(new Date());
 }
 
 /**
 * Time - VBA equivalent - returns the time part of now
 * @return {Date} the date object now
 */
 function Time () {
   return TimeValue(new Date());
 }
 
 /**
 * DateValue - VBA equivalent - Returns the date part of given time
 * @param {Date} dateTime the date to process
 * @return {Date} the date object 
 */
 function DateValue (dateTime) {
   return ['Hours','Minutes','Seconds','Milliseconds'].reduce(function(p,c) {
     p['set'+c](0);
     return p;
   },new Date(dateTime));
 }
 
/**
 * TimeValue - VBA equivalent - Returns the time part of given date
 * @param {Date} dateTime the date to process
 * @return {Date} the date object 
 */
 function TimeValue (dateTime) {
   return ['Hours','Minutes','Seconds','Milliseconds'].reduce(function(p,c) {
     p['set'+c](dateTime['get'+c]());
     return p;
   },new Date(0));
 }
 
/**
 * Year - VBA equivalent - Returns the year part of given time
 * @param {Date} dateTime the date to process
 * @return {number} the year 
 */
 function Year (dateTime) {
   return DatePart("yyyy",dateTime);
 }
 
 /**
 * Month - VBA equivalent - Returns the month part of given time
 * @param {Date} dateTime the date to process
 * @return {number} the month 
 */
 function Month (dateTime) {
   return DatePart("m",dateTime);
 }
 
/**
 * Day - VBA equivalent - Returns the day part of given time
 * @param {Date} dateTime the date to process
 * @return {number} the day 
 */
 function Day (dateTime) {
   return DatePart("d",dateTime);
 }
 
 /**
 * Hour - VBA equivalent - Returns the hour part of given time
 * @param {Date} dateTime the date to process
 * @return {number} the hour 
 */
 function Hour (dateTime) {
   return DatePart("h",dateTime);
 }

/**
 * Minute - VBA equivalent - Returns the minute part of given time
 * @param {Date} dateTime the date to process
 * @return {number} the Minute 
 */
 function Minute (dateTime) {
   return DatePart("n",dateTime);
 }
 
/**
 * Second - VBA equivalent - Returns the Second part of given time
 * @param {Date} dateTime the date to process
 * @return {number} the second 
 */
 function Second (dateTime) {
   return DatePart("s",dateTime);
 }
 
/**
 * Weekday - VBA equivalent - Returns the weekday
 * @param {Date} dateTime the date to process
 * @param {number} [startOfWeek=vbUseSystemDayOfWeek] the day the week starts on
 * @return {number} the weekday 
 */
 function Weekday (dateTime, startOfWeek) {
   return new DateHelpers(startOfWeek).weekDay(dateTime);
 }


 /**
  * DatePart - takes an interval and returns the approproate measure
  * @param {string} interval the interval - eg yyyy for year
  * @param {Date} dateTime the date to work on
  * @param {number} [startOfWeek=vbUseSystemDayOfWeek] the day the week starts on
  * @param {number} [startWeekOfYear=] the week the year starts on
  * @return {number} the measure
  */
  function DatePart (interval , dateTime,startOfWeek,startWeekOfYear) {
    return new DateHelpers(startOfWeek, startWeekOfYear).part(interval, dateTime);
  }

  
  /**
  * calculate date2 - date1 using given interval
  * @param {Date} date1 the lower date 
  * @param {Date} date2 the higher date
  * @param {string} interval one of the known intervals
  * @param {number} [startOfWeek=vbUseSystemDayOfWeek] the day the week starts on
  * @param {number} [startWeekOfYear=] the week the year starts on
  * @return {number} the rounded difference
  */
  function DateDiff ( interval, date1, date2, startOfWeek, startWeekOfYear ) {
    return new DateHelpers(startOfWeek, startWeekOfYear).dif(interval, date1, date2);
  }

  
 /**
  * add to dates 
  * @param {string} interval the interval unit
  * @param {number} measure houw much to add
  * @param {Date} dateTime date to operate on
  * @return {Date} the new date
  */
  function DateAdd(interval, measure, dateTime) {
    return new DateHelpers().add (interval , measure , dateTime);
  }
  
  /**
   * a  helpers function common to some of the date calculations
   * @constructor
   * @param {number} [startOfWeek] the day the week starts on
   * @param {number} [startWeekOfYear] the week the year starts on
   */
  function DateHelpers (startOfWeek,startWeekOfYear) {
    'use strict';
    
    var self = this;
    var startOfWeek_ = fixOptional(startOfWeek,vbUseSystemDayOfWeek);
    var startWeekOfYear_  =fixOptional(startWeekOfYear,vbFirstJan1 );
    
    // check its a valid interval 
    function checkInterval_ (interval) {
      
      // mapping of units to function names and multiplier
      var unitMap = {
        "yyyy":{f:"FullYear",m:1,dif:function (d1,d2) { 
            return d2.getUTCFullYear() - d1.getUTCFullYear();
        }},
        "q":{f:"Month", m:1,x:function(d) { 
            return 1 + Math.floor(d.getMonth()  / 4);
          },
          dif:function (d1,d2) {
            return  this.m.dif(d1,d2)/3;
        }},
        "m":{f:"Month",m:3,x:function(d) {
            return d.getMonth() + 1;
          },
          dif:function (d1,d2) {
            return d2.getUTCMonth() - d1.getUTCMonth() + this.yyyy.dif(d1,d2)*12;
          }
        },
        "d":{f:"Date",m:1,dif:function (d1,d2) { 
            return (d2.valueOf() - d1.valueOf())/DAYMS;
        }},
        "h":{f:"Hours",m:1,dif:function (d1,d2) { 
            return (d2.valueOf() - d1.valueOf())/HOURMS;
        }},
        "n":{f:"Minutes",m:1,dif:function (d1,d2) { 
            return (d2.valueOf() - d1.valueOf())/MINMS;
        }},
        "s":{f:"Seconds",m:1, dif:function (d1,d2) { 
            return (d2.valueOf() - d1.valueOf())/SECMS;
        }},
        "ww":{f:"Date",m:7,x:weekNumber_,dif:function (d1,d2) { 
            return this.ww.x(d2) - this.ww.x(d1);
        }},
        "w":{f:"Date",m:1,x:weekDay_,dif:function (d1,d2) { 
            return this.d.dif(d1,d2)/7;
        }},
        "y":{f:"Date",m:1,dif:function (d1,d2) { 
            return this.d.dif(d1,d2);
         }}
      }
      
      // check its valid and return the mapping
      interval = interval.toLowerCase();
      if (!unitMap[interval]) throw new Error("unknown date difference interval " + interval);
      
      return unitMap[interval];
    }
    
   /**
    * helper to add to dates 
    * @param {string} interval the interval unit
    * @param {number} measure houw much to add
    * @param {Date} dateTime date to operate on
    * @return {Date} the new date
    */
    self.add = function (interval , measure , dateTime) {
      
      return helper (dateTime, checkInterval_ (interval) ,measure);
      
      // do the calculation
      function helper (d,unit,m) {
        var newDate = new Date(d);
        newDate['set'+unit.f](d['get'+unit.f]() + unit.m * m);
        return newDate;
      }

    };
    
   /**
    * helper to diff to dates 
    * @param {string} interval the interval unit
    * @param {d1} dateTime smaller date
    * @param {d2} dateTime larger date
    * @return {number} the difference
    */
    self.dif = function (interval ,  d1, d2) {
      
      return helper (utcDate(d1),utcDate(d2), checkInterval_ (interval) );
      
      // do the calculation
      function helper (d1,d2,unit,m) {
        return unit.dif(d1,d2);
      }

    };
    
    function utcDate (d) {
      return new Date (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()));
    }
   /**
    * helper to calculate dateparts 
    * @param {string} intervl the interval
    * @param {Date} dateTime the date
    * @return {number} the datepart
    */
    self.part = function (interval ,  dateTime ) {
      
      var unit = checkInterval_ (interval);
      
      // if there's an exception function execute that, otherwise do the regular date function
      return unit.x ? unit.x(dateTime) : dateTime['get'+unit.f](dateTime);

    };
    
   /**
    * helper to calculate weekday
    * @param {Date} dateTime the date
    * @return {number} the weekday
    */
    function weekDay_ (dateTime) {
      return workMod_ (1+dateTime.getDay()-startOfWeek_ , 7) +1;
    }
    
    /**
     * this one is exposed too
     */
    self.weekDay = function (dateTime) {
      return weekDay_(dateTime);
    }


    function weekNumber_ (dateTime) {
    
      // week starts on 1st Jan
      if (startWeekOfYear_ === vbFirstJan1) {
        return Math.ceil( (6+( dateTime.getTime() - new Date(dateTime.getFullYear(),0,0).getTime() ) / DAYMS) /7 );
      }

      // week starts on 1st week with full 4 days - with day 1 = monday, this is the ISO week number method
      // would call like weeknum(d,2,2);
      
      if (startWeekOfYear_ === vbFirstFourDays) {
       
        // adjust weekday to start of week
        var start = self.add ("d", -weekDay_ (dateTime ,startOfWeek_) , dateTime);
        
        // get start of year of week numbers
        var startYear = new Date (self.add ("d", 4, start).getFullYear(),0,1);
       
        // this is the week number
        return Math.floor (  DateDiff( "d", startYear, self.add ("d", 7 + 4, start)) /7     );

      }
    
      // week starts on 1st week with full week
      if (startWeekOfYear_ === vbFirstFullWeek) {
        throw new Error ("first full week not implemented");

      }
    
      throw new Error ("unknown startofweekyear value " + startWeekOfYear_);
    
    }
  
   /**
    * worksheet mod & % dont return the same result with -ve numbers..
    * @param {number} theNumber the number
    * @param {number} theDivisor the divisor
    * @return {number} the mod
    */
    function workMod_ (theNumber ,theDivisor ) {
      return theNumber - theDivisor * Math.floor (theNumber/theDivisor);
    }
    
    return self;
  }

 

 

  

