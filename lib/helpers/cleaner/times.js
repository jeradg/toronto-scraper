var moment = require( 'moment-timezone' );

module.exports = function( date, timeRange ) {
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
};