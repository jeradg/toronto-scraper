var exports = module.exports = scraper,
    getURLs = require( './getURLs' ),
    updateVenues = require( './updateVenues' );

function scraper( indexURLs, callback ) {
  getURLs( indexURLs, function( err, urls ) {
    if ( err ) {
      callback( err );
    } else {
      updateVenues( urls, callback );
    }
  } );
}