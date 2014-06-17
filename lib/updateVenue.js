var exports = module.exports = updateVenue,
    mongoose = require( 'mongoose' ),
    VenueModel = require( './models/venueModel' );

function updateVenue( venue, result, callback ) {
  VenueModel.update( {
    '_id': mongoose.Types.ObjectId( result.id )
  }, {
    schedule: venue.schedule
  }, function( err, n, response ) {
    if ( err ) {
      callback( err );
    } else {
      console.log( 'Updated ' + venue.name );          
      callback( null );
    }
  } );
}