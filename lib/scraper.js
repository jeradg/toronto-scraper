var exports = module.exports = scraper,
    getVenueURLs = require( './getVenueURLs' ),
    updateVenues = require( './updateVenues' );

function scraper( indexURLs, callback ) {
  getVenueURLs( indexURLs, function( err, urls ) {
    if ( err ) {
      callback( err );
    } else {
      updateVenues( urls, callback );
    }
  } );
}