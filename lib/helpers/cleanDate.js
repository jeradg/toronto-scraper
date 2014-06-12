var exports = module.exports = cleanDate,
    dateHelpers = require( './dateHelpers' );

function cleanDate( dateString ) {
  // Toronto.ca doesn't provide years in their schedule, so we have to 
  // figure out if a given date is this year, last year or next year.
  // (Esp. when December and January are in the schedule.) We do this
  // by seeing if the day of the week for the date matches the day of
  // the week for that date this year. If not, we check next year, and
  // if not that either, it's last year.

  var today = new Date(),
      thisYear = today.getFullYear(),
      lastYear = thisYear - 1,
      nextYear = thisYear + 1,
      dayOfTheWeekString = dateString.substr( 0, 3 ),
      dayOfTheWeekNum,
      dateThisYear = new Date( dateString.substr( 3 ) + ' ' + thisYear ),
      dateLastYear = new Date( dateString.substr( 3 ) + ' ' + lastYear ),
      dateNextYear = new Date( dateString.substr( 3 ) + ' ' + nextYear ),
      date;

  for ( var i = 0; i < dateHelpers.daysOfTheWeek.length; i++ ) {
    if ( dayOfTheWeekString === dateHelpers.daysOfTheWeek[ i ] ) {
      dayOfTheWeekNum = i;
    }
  }

  if ( dayOfTheWeekNum === dateThisYear.getDay() ) {
    date = dateThisYear;
  } else if ( dayOfTheWeekNum === dateNextYear.getDay() ) {
    date = dateNextYear;
  } else if ( dayOfTheWeekNum === dateNextYear.getDay() ) {
    date = dateLastYear;
  }

  return date;
}