// utils.js The node runtime is limited to a single CPU core and about 1.5 GB of memory.

import styled from 'styled-components'; // NavBarStyles

export const ProgramVersion = '2020.12.12';
export const BeginningDateStr = '2000-01-01';
export const BeginningYear = 2000;

export function ApiURl() {
  const DefaultPort = 5000;
  const DefaultPortStr = ':'+DefaultPort.toString();
  const DefaultHost = 'http://localhost'  
  
  const url = process.env.REACT_APP_API_DOMAIN || DefaultHost; 
  const apiPort = process.env.PORT || DefaultPort;  
  if (typeof(process.env.PORT) === 'undefined')  {  
    const url = DefaultHost + DefaultPortStr;  
    return url;
  }
  console.log(url + ':' + apiPort);
  return url + ':' + apiPort;
}

export function ValidUrl(value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

export function ProcessError(err, msg) {
  const dbError = ' unable to connect to the database server.';
  if (typeof(err) === 'undefined' || err === null) {
    if (msg.endsWith(':'))  { // axios db error
      alert(msg + dbError);
    } else {
      alert(msg)
    }
    return;
  }

  if (err.response) { 
    console.log('a) ' + err.response.status + ': ' + err.response.data);  // server responds with a 4xx/5xx error.
  } else if (err.request) {
    console.log('b) ' + err.request); 
  } else if (err) {
    console.log('c) ' + err);
  }
  if (msg.endsWith(':'))  { // axios db error
    alert(msg + dbError);
  } else {
    alert(msg)
  }
}

// 2020-03-05T00:00:00Z => return string.
export function ExtractDate(dateStr) {
  return dateStr.slice(5,7) + '/' + dateStr.slice(8,10) + '/' + dateStr.slice(0,4);
}

// Fri Jan 01 2016 00:00:00 GMT-0700 => '2016-01-01'
export function SimplifyDate(d) {
  const parts = d.toString().split(' ');
  const months = {Jan: '01',Feb: '02',Mar: '03',Apr: '04',May: '05',Jun: '06',Jul: '07',Aug: '08',Sep: '09',Oct: '10',Nov: '11',Dec: '12'};
  return parts[3]+'-'+months[parts[1]]+'-'+parts[2];
}

function getFirstDayOfYear(year) {
  return new Date(year, 0, 1, 0, 0, 0, 0);
}

// ensures that a last day is the same month as the first day,
function getHourTimezoneOffset() {
  return 23 - (new Date()).getTimezoneOffset() / 60; // getTimezoneOffset() returns minutes.
}


// Dec 31, 23:59:59
function getLastDayOfYear(year) { 
  return new Date(year, 11, 31, getHourTimezoneOffset(), 59, 59, 59);
}

// quarter={1..4}
function getFirstDayOfQuarter(quarter,year) {
  return new Date(year, (quarter-1)*3, 1, 0, 0, 0, 0);
}

// quarter={1..4}
function getLastDayOfQuarter(quarter,year) {
  let lastDay = monthDays[quarter*3-1];
  if (lastDay === 1 && leapYears.indexOf(year) !== -1) lastDay++;  // Feb leap year.
  return new Date(year, quarter*3-1, lastDay, getHourTimezoneOffset(), 59, 59, 59);  
}

function getFirstDayOfMonth(adate) {  // trivial
  return new Date(adate.getFullYear(), adate.getUTCMonth(), 1, 0, 0, 0, 0);
}

function getLastDayOfMonth(adate) {
  const xmonth = adate.getUTCMonth();
  let lastDay = monthDays[xmonth];  //  zero-based, but day starts at 1.
  if (xmonth === 1 && leapYears.indexOf(adate.getFullYear()) !== -1)  lastDay++;  // Feb leap year.
  const newDate = new Date(adate.getFullYear(), xmonth, lastDay, getHourTimezoneOffset(), 59, 59, 59); 
  return newDate;
}

// Display in reverse time-order. Value of 0 is 'unknown'. Includes startdate, enddate date properties.
// timePeriod is single element from TimePeriodOptions[].  Ignore Week.  
export function TimePeriodRanges(timePeriod) {  
  const today = new Date();   // every range contains following zeroth element.
  let timePeriodRange = [ {value:0, label:SelectTimePeriod, startdate:getFirstDayOfYear(today.getFullYear()), enddate:today} ];
  let startingDate = getFirstDayOfYear(StartingYear); 
  let valueIndex = 1;  // increment
  let yearIndex = today.getFullYear();  // decrement
  const periodLabel = timePeriod.label.toString().toLowerCase();

  switch(periodLabel) { 
    case 'month': 
      do { 
        let monthIndex = 11; // decrement
        let startOfMonth = getFirstDayOfYear(yearIndex);
        do {  
          startOfMonth.setMonth(monthIndex);
          const exclude = yearIndex === today.getFullYear() && monthIndex > today.getUTCMonth();
          if (!exclude) { // ignore future months but include this month.
            let item = {value:valueIndex, label:monthNames[startOfMonth.getUTCMonth()]+' '+startOfMonth.getFullYear().toString(), startdate:startOfMonth, enddate:getLastDayOfMonth(startOfMonth)};
            timePeriodRange.push(item);
          }
          valueIndex++;
          monthIndex--;
        }
        while ( monthIndex >= 0);
        yearIndex--;
      }
      while ( yearIndex >=  StartingYear);
      return timePeriodRange;

    case 'quarter': 
      do { 
        let quarterIndex = 4; // decrement
        do {  
          const exclude = yearIndex === today.getFullYear() && quarterIndex > today.getUTCMonth() / 4;
          if (!exclude) { // ignore future quarters but include this quarter. 
            let item = {value:valueIndex, label:'Q'+quarterIndex.toString()+' '+yearIndex.toString(), startdate:getFirstDayOfQuarter(quarterIndex,yearIndex), enddate:getLastDayOfQuarter(quarterIndex,yearIndex)};
            timePeriodRange.push(item);
          }
          valueIndex++;
          quarterIndex--;
        }
        while ( quarterIndex > 0);
        yearIndex--;
      }
      while ( yearIndex >= StartingYear);
      return timePeriodRange;

    case 'year': 
      do { 
        let item = {value:valueIndex, label: yearIndex.toString(), startdate:getFirstDayOfYear(yearIndex), enddate:getLastDayOfYear(yearIndex)};
        timePeriodRange.push(item);
        valueIndex++;
        yearIndex--;
      }
      while ( yearIndex >= StartingYear);
      return timePeriodRange;

    case 'term': 
      valueIndex = Math.floor((yearIndex-BeginningYear)/4) + 1; 
      yearIndex = BeginningYear;   // want this at end of array .
      do { 
        let xlabel = yearIndex.toString() + ' through ' + (yearIndex+3).toString();
        let item = {value:valueIndex, label: xlabel, startdate:getFirstDayOfYear(yearIndex), enddate:getLastDayOfYear(yearIndex+3)};
        timePeriodRange.push(item);
        valueIndex--;
        yearIndex = yearIndex + 4;
      }
      while ( yearIndex <= today.getFullYear());
      // reverse array so most recent appears first, but have to move last element to zeroth.
      timePeriodRange.reverse();
      timePeriodRange.unshift(timePeriodRange.pop());
      return timePeriodRange;

    case 'span': 
      let item = {value:1, label:'2000 through Today', startdate:startingDate, enddate:today};
      timePeriodRange.push(item);
      return timePeriodRange;

    default:
        ProcessError(null, 'Invalid case in TimePeriodRanges!');  
  }
  return timePeriodRange;
}

// GetTimeInterval() returns timeinterval = {periodstr: , startdatestr: , enddatestr: } object.  Similar to nt.TimeInterval struct.
// Input parameters are dropdown menu choices (strings) from Header.js; reflects TimePeriodRanges(timePeriod)
export function GetTimeInterval(timePeriodLabel, startingTimePeriod) {  
  const periodLabel = timePeriodLabel.toString().toLowerCase();
  switch(periodLabel) { 
    case 'month': // 'Oct 2021' 
      const yearM = parseInt(startingTimePeriod.substring(4));
      const monthM = monthNames.indexOf(startingTimePeriod.substring(0,3));
      const adateM = new Date(yearM, monthM, 1, 0, 0, 0, 0);
      return {periodstr: timePeriodLabel, startdatestr: FormatUTCdate(getFirstDayOfMonth(adateM)), enddatestr: FormatUTCdate(getLastDayOfMonth(adateM)) };

    case 'quarter': // 'Q1 2020'
      const quarterQ = parseInt(startingTimePeriod.substring(1, 2));
      const yearQ = parseInt(startingTimePeriod.substring(3));
      return {periodstr: timePeriodLabel, startdatestr: FormatUTCdate(getFirstDayOfQuarter(quarterQ,yearQ)), enddatestr: FormatUTCdate(getLastDayOfQuarter(quarterQ,yearQ)) };

    case 'year': const yearY = parseInt(startingTimePeriod);
      return {periodstr: timePeriodLabel, startdatestr: FormatUTCdate(getFirstDayOfYear(yearY)), enddatestr: FormatUTCdate(getLastDayOfYear(yearY)) };

    case 'term': 
      const startYear = parseInt(startingTimePeriod.substring(0, 4));
      return {periodstr: timePeriodLabel, startdatestr: FormatUTCdate(getFirstDayOfYear(startYear)), enddatestr: FormatUTCdate(getLastDayOfYear(startYear+3)) }; 

    case 'span':
      return {periodstr: timePeriodLabel, startdatestr: BeginningDateStr, enddatestr: FormatUTCdate( new Date() )};

    default: ProcessError(null, 'Invalid case in GetTimeInterval!');  
    }
}

// Return array of {periodstr, startdatestr, enddatestr} by iterating until current date (even if empty).
export function GetTimeIntervals(timePeriodLabel, startingTimePeriod) {  
  const periodLabel = timePeriodLabel.toString().toLowerCase();
  const today = new Date();
  let periodList = [];

  switch (periodLabel) { 
    case 'month':  // 'Oct 2021'  
      let yearM = parseInt(startingTimePeriod.substring(4));
      let monthM = monthNames.indexOf(startingTimePeriod.substring(0,3));
      do { 
        const lastMonth = (yearM !== today.getFullYear() ? 12 : today.getMonth()+1); // ternary
        do {  
          const adateM = new Date(yearM, monthM, 1, 0, 0, 0, 0);
          const item = {periodstr: timePeriodLabel, startdatestr: FormatUTCdate(getFirstDayOfMonth(adateM)), enddatestr: FormatUTCdate(getLastDayOfMonth(adateM)) };
          periodList.push(item);
          monthM++;
        }
        while ( monthM < lastMonth);
        monthM = 0;
        yearM++;
      }
      while ( yearM <= EndingYear);
      return periodList;

    case 'quarter': // 'Q1 2020' 
      let quarterQ = parseInt(startingTimePeriod.substring(1, 2));
      let yearQ = parseInt(startingTimePeriod.substring(3));
      do { 
        const lastQuarter = (yearQ !== today.getFullYear() ? 4 : Math.floor(today.getMonth())+1 ); // ternary
        do {  
          const item = {periodstr: timePeriodLabel, startdatestr: FormatUTCdate(getFirstDayOfQuarter(quarterQ,yearQ)), enddatestr: FormatUTCdate(getLastDayOfQuarter(quarterQ,yearQ)) };
          periodList.push(item);
          quarterQ++;
        }
        while ( quarterQ <= lastQuarter);
        quarterQ = 1;
        yearQ++;
      }
      while ( yearQ <= EndingYear);
      return periodList;

    case 'year': 
      let yearY = parseInt(startingTimePeriod);
      do { 
        const item = {periodstr: timePeriodLabel, startdatestr: FormatUTCdate(getFirstDayOfYear(yearY)), enddatestr: FormatUTCdate(getLastDayOfYear(yearY)) };
        periodList.push(item);
        yearY++;
      }
      while ( yearY <= EndingYear);
      return periodList;

    case 'term': 
      let yearT = parseInt(startingTimePeriod.substring(0, 4));
      do { 
        const item = {periodstr: timePeriodLabel, startdatestr: FormatUTCdate(getFirstDayOfYear(yearT)), enddatestr: FormatUTCdate(getLastDayOfYear(yearT + 3)) };
        periodList.push(item);
        yearT = yearT + 4;
      }
      while ( yearT < EndingYear);
      return periodList;

    case 'span':
      return {periodstr: timePeriodLabel, startdatestr: BeginningDateStr, enddatestr: FormatUTCdate( new Date() )};

    default: ProcessError(null, 'Invalid case in GetTimeIntervals!');  
    }
}

/*********************************************************************************/

// backgroundColor style 
export const bgcPurple = '#9a4ef1';
export const bgcLightRed = '#f14e4e';
export const bgcLightGreen = '#4ef18f';

export const StartingYear = 2000;
export const EndingYear = new Date().getFullYear();
export const SelectTimePeriod = 'Select a time period.';
export const SelectStartingTime = 'Select a starting time.';
export const SelectQueryName = 'Select a query.';

export const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const monthDays =    [31,    28,    31,    30,    31,    30,    31,    31,    30,    31,    30,    31];
export const leapYears = [2000, 2004, 2008, 2012, 2016, 2020, 2024, 2028];

// Ignores {0, 'Unknown', 1,'Weekly',}  See acmsearchlib/nulltime/nulltime.go
export const TimePeriodOptions = [{value:-1, label:SelectTimePeriod}, {value:2, label:'Month'}, {value:3, label:'Quarter'}, {value:4, label:'Year'}, {value:5, label:'Term'}, {value:6, label:'Span'} ];

// sourced from local acm.env file.  
export const SourceFileDirectory = process.env.REACT_ACM_SOURCE_DIR || '/home/david/websites/acmsearch/docs/';

export const AxiosProxy = {
  //baseURL: process.env.REACT_APP_API_DOMAIN || window.API_URL_BASE,
  timeout: 2000 
};
  
export const NavBarStyles = styled.div`
  .navbar { background-color: #222;}
  a, .navbar-nav, .navbar-light .nav-link {
    width:100%;
    margin: 0 0 3em 0;
    color: #ffaf9f;
    &:hover { color: white; }
  }
  .navbar-brand {
    font-size: 1.4em;
    color: #a49fff;
    &:hover { color: white; }
  }
  .form-center {
    position: absolute !important;
    left: 5%;
    right: 5%;
  }`;

export const CONCURRENCY = process.env.WEB_CONCURRENCY || 1;

export const ENV = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';

export const FormatFieldLengths = (min, max) => {
  return ' [' + min.toString() + '-' + max.toString() + '] ';
}

export const TruncateString = (str, num) => {
  if (str.length <= num) {
    return str;
  }
  return str.slice(0, num);
}

// String interpolation within template literal allows embedded expressions.
// Return MM/DD/YYYY
export const FormatDate = (dateObj) => {
  return `${('0' + (dateObj.getUTCMonth() + 1)).slice(-2)}/${('0' + dateObj.getUTCDate()).slice(-2)}/${dateObj.getUTCFullYear()}`;
}

// return YYYY-MM-DD
export const FormatUTCdate = (dateObj) => {
  return `${dateObj.getUTCFullYear()}-${('0' + (dateObj.getUTCMonth() + 1)).slice(-2)}-${('0' + dateObj.getUTCDate()).slice(-2)}`;
}

// return YYYY-MM-DD
export const FormatISOdate = (dateObj) => {
  return dateObj.toISOString().split('T')[0];
}
