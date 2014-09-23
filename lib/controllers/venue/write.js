var updateVenue = require( './update' ),
    createVenue = require( './create' ),
    Venue = require( '../../models/venue' );

module.exports = function( venue, callback ) {
  Venue.findOne( {
    'name': venue.name
  }, function( err, result ) {
    if ( err ) {
      callback( err );
    } else {
      if ( result ) {
        // If the venue already exists in the database, update its schedule
        updateVenue( venue, result, callback );
      } else {
        // Otherwise, create it
        createVenue( venue, callback );
      }
    }
  } );
};