var exports = module.exports = createVenue,
    request = require( 'request' ),
    VenueModel = require( './models/venueModel' );

function createVenue( venue, callback ) {
  VenueModel.create( venue, function( err, venue ) {
    if ( err ) {
      callback( err );
    } else {
      console.log( 'Created ' + venue.name );
      callback( null );
    }
  } );
}