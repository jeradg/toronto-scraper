var exports = module.exports,
    moment = require( 'moment-timezone' );

// Toronto.ca posts days of the week as these abbreviations.
// We use these in scrapeVenue() to determine if a particular date is this year, last year or next year.
var daysOfTheWeek = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];

function cleanDate( dateString ) {
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

  for ( var i = 0; i < daysOfTheWeek.length; i++ ) {
    if ( dayOfTheWeekString === daysOfTheWeek[ i ] ) {
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
}

function processTimes( date, timeRange ) {
  // 'date' is a date string with the format 'YYYY-MM-DD' with 
  // the year, month and date of the day in which the times occur
  var session = {},
      am = ( timeRange.indexOf( 'am' ) !== -1 ) ? true : false,
      pm = ( timeRange.indexOf( 'pm' ) !== -1 ) ? true : false,
      times = timeRange.split( '-' ),
      startMoment,
      endMoment;

  times[ 0 ] = times[ 0 ].trim().replace( /[a-zA-Z]*/gm, '' );
  times[ 1 ] = times[ 1 ].trim().replace( /[a-zA-Z]*/gm, '' );

  for ( var j = 0; j < times.length; j++ ) {
    if ( times[ j ].indexOf( ':' ) !== -1 ) {
      times[ j ] = times[ j ].split( ':' );
      times[ j ][ 0 ] = parseInt( times[ j ][ 0 ], 10 );
      times[ j ][ 1 ] = parseInt( times[ j ][ 1 ], 10 );
    } else {
      times[ j ] = [ parseInt( times[ j ], 10 ), '00' ];
    }
  }

  if ( am && pm ) { // If one of the times is in the AM and the other is PM, add
    times[ 1 ][ 0 ] = times[ 1 ][ 0 ] === 12 ? times[ 1 ][ 0 ] : times[ 1 ][ 0 ] + 12;
  } else if ( pm ) { // i.e., else if ( pm && !am )
    times[ 0 ][ 0 ] = times[ 0 ][ 0 ] === 12 ? times[ 0 ][ 0 ] : times[ 0 ][ 0 ] + 12;
    times[ 1 ][ 0 ] = times[ 1 ][ 0 ] === 12 ? times[ 1 ][ 0 ] : times[ 1 ][ 0 ] + 12;
  } // If only am, don't add 12 because both hours are in the AM

  startMoment = moment( date, 'YYYY-MM-DD' ).tz( 'America/Toronto' ).hours( times[ 0 ][ 0 ] ).minutes( times[ 0 ][ 1 ] );
  endMoment = moment( date, 'YYYY-MM-DD' ).tz( 'America/Toronto' ).hours( times[ 1 ][ 0 ] ).minutes( times[ 1 ][ 1 ] );

  session.start = new Date( startMoment );
  session.end = new Date( endMoment );

  return session;
}

exports.daysOfTheWeek = daysOfTheWeek;
exports.cleanDate = cleanDate;
exports.processTimes = processTimes;