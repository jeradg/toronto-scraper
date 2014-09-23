var mongoose = require( 'mongoose' ),
    Venue = require( '../../models/venue' );

module.exports = function( venue, result, callback ) {
  Venue.update( {
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
};