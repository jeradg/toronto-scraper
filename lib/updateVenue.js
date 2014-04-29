var exports = module.exports = updateVenue,
    mongoose = require( 'mongoose' ),
    VenueModel = require( './models/venueModel' );

function updateVenue( someVenue, foundVenue, callback ) {
  VenueModel.update( { '_id': mongoose.Types.ObjectId( foundVenue.id ) }, { schedule: someVenue.schedule }, function( error, venue ) {
    if ( !error ) {
      console.log( 'Updated ' + someVenue.name );          
      callback();
    } else {
      return console.log( error );
    }
  } );
}
