var moment = require( 'moment-timezone' ),
    days = require( './days' );

module.exports = function( dateString ) {
  // Toronto.ca doesn't provide years in their schedule, so we have to 
  // figure out if a given date is this year, last year or next year.
  // (Esp. when December and January are in the schedule.) We do this
  // by seeing if the day of the week for the date matches the day of
  // the week for that date this year. If not, we check next year, and
  // if not that either, it's last year.
  var today = moment(),
      thisYear = today.year(),
      lastYear = thisYear - 1,
      nextYear = thisYear + 1,
      dayOfTheWeekString = dateString.substr( 0, 3 ),
      dayOfTheWeekNum,
      dateThisYear = moment( thisYear + ' ' + dateString.substr( 3 ), 'YYYY-MMM-DD'),
      dateLastYear = moment( lastYear + ' ' + dateString.substr( 3 ), 'YYYY-MMM-DD'),
      dateNextYear = moment( nextYear + ' ' + dateString.substr( 3 ), 'YYYY-MMM-DD'),
      date;

  for ( var i = 0; i < days.length; i++ ) {
    if ( dayOfTheWeekString === days[ i ] ) {
      dayOfTheWeekNum = i;
    }
  }

  if ( ( dayOfTheWeekNum === dateThisYear.day() ) && dateThisYear.isValid() ) {
    date = dateThisYear;
  } else if ( ( dayOfTheWeekNum === dateLastYear.day() ) && dateLastYear.isValid() ) {
    date = dateLastYear;
  } else if ( ( dayOfTheWeekNum === dateNextYear.day() ) && dateNextYear.isValid() ) {
    date = dateNextYear;
  } else {
    throw new Error( 'Cannot determine the year for the date ' + dateString );
  }

  return date.format( 'YYYY-MM-DD' );
};