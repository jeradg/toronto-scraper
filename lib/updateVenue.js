var exports = module.exports = updateVenue,
    mongoose = require( 'mongoose' ),
    VenueModel = require( './models/venueModel' );

function updateVenue( someVenue, foundVenue, callback ) {
  VenueModel.update( { '_id': mongoose.Types.ObjectId( foundVenue.id ) }, { schedule: someVenue.schedule }, function( err, venue ) {
    if ( err ) {
      callback( err );
    } else {
      console.log( 'Updated ' + someVenue.name );          
      callback( null );
    }
  } );
}