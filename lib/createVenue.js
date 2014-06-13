var exports = module.exports = createVenue,
    request = require( 'request' ),
    VenueModel = require( './models/VenueModel' );

function createVenue( venue, callback ) {
  VenueModel.create( {
    name: venue.name,
    url: venue.normalizedUrl,
    originalUrl: venue.url,
    type: venue.type,
    description: venue.description,
    address: venue.address,
    location: {
      type: 'Point',
      coordinates: venue.coordinates,
      index: '2dsphere'
    },
    phone: venue.phone,
    accessibility: venue.accessibility,
    ward: venue.ward || 0, // Defaults to 0
    district: venue.district,
    intersection: venue.intersection,
    transit: venue.transit,
    schedule: venue.schedule
  }, function( err, venue ) {
    if ( err ) {
      callback( err );
    } else {
      console.log( 'Created ' + venue.name );
      callback( null );
    }
  } );
}