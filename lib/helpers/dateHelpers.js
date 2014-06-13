var exports = module.exports;

// exports.getWeekNumber = function( date ) {
// /* Based on http://stackoverflow.com/a/6117889/2140241
//  * ---------------------------------------------------
//  * For a given date, get the ISO week number
//  *
//  * Based on information at:
//  *
//  *    http://www.merlyn.demon.co.uk/weekcalc.htm#WNR
//  *
//  * Algorithm is to find nearest Thursday, its year
//  * is the year of the week number. Then get weeks
//  * between that date and the first day of that year.
//  *
//  * Note that dates in one year can be weeks of previous
//  * or next year, overlap is up to 3 days.
//  *
//  * e.g. 2014/12/29 is Monday in week  1 of 2015
//  *      2012/1/1   is Sunday in week 52 of 2011
//  */
//   var dateCopy = new Date( date ),
//       yearStart,
//       weekNumber,
//       nearestThursday,
//       sunday;
  
//   dateCopy.setHours( 0, 0, 0 );

//   // Set nearestThursday: current date + 4 - current day number
//   nearestThursday = new Date( dateCopy );
//   nearestThursday.setDate( dateCopy.getDate() + 4 - dateCopy.getDay() );
  
//   // Set sunday
//   sunday = new Date( nearestThursday );
//   sunday.setDate( nearestThursday.getDate() - 4 );
  
//   // Get first day of year
//   yearStart = new Date( nearestThursday.getFullYear(), 0, 1 );
  
//   // Calculate full weeks from first day of year to nearest Thursday
//   weekNumber = Math.ceil( ( ( ( nearestThursday - yearStart ) / 86400000 ) + 1 ) / 7 )
  
//   // Return array of year, week number, and the first date in the week (Sunday's date object)
//   return [ yearStart.getFullYear(), weekNumber, sunday ];
// }

exports.processTimes = function( dateObject, rawTimeRange ) {
  var session = {},
      am = ( rawTimeRange.indexOf( 'am' ) !== -1 ) ? true : false,
      pm = ( rawTimeRange.indexOf( 'pm' ) !== -1 ) ? true : false,
      thisMonth = dateObject.getMonth() < 9 ? ( '0' + ( dateObject.getMonth() + 1 ) ) : dateObject.getMonth() + 1,
      thisDate = dateObject.getDate() < 10 ? ( '0' + dateObject.getDate() ) : dateObject.getDate(),
      thisFullDate = dateObject.getFullYear() + '-' + thisMonth + '-' + thisDate,
      offset = new Date().getTimezoneOffset(),
      times = rawTimeRange.trim().split( ' - ' );

  times[ 0 ] = times[ 0 ].replace( /[a-zA-Z]*/gm, '' );
  times[ 1 ] = times[ 1 ].replace( /[a-zA-Z]*/gm, '' );

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

  // If the hour or minute needs a leading 0, add it
  for ( var j = 0; j < times.length; j++ ) {
    for ( var k = 0; k < times[ j ].length; k++ ) {
      if ( times[ j ][ k ].toString().length === 1 ) {
        times[ j ][ k ] = '0' + times[ j ][ k ];
      }
    }
  }

  session.start = times[ 0 ][ 0 ] + ':' + times[ 0 ][ 1 ];
  session.end = times[ 1 ][ 0 ] + ':' + times[ 1 ][ 1 ];
  // if ( session.start == 'Invalid Date' ) {
  //   console.log( 'ERROR - Invalid date: ' + thisFullDate + 'T' + times[ 0 ][ 0 ] + ':' + times[ 0 ][ 1 ] + ':00-04:00' );
  // } else {
    return session;
  // }
}

// Toronto.ca posts days of the week as these abbreviations.
// We use these in scrapeVenue() to determine if a particular date is this year, last year or next year.
exports.daysOfTheWeek = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ];