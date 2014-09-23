var request = require( 'request' ),
    Venue = require( '../../models/venue' );

module.exports = function( venue, callback ) {
  Venue.create( venue, function( err, venue ) {
    if ( err ) {
      callback( err );
    } else {
      console.log( 'Created ' + venue.name );
      callback( null );
    }
  } );
};