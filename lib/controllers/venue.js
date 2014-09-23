var exports = module.exports,
    getURLs = require( './venue/getURLs' ),
    getVenues = require( './venue/getVenues' );

exports.run = function( indexURLs, callback ) {
  getURLs( indexURLs, function( err, urls ) {
    if ( err ) {
      callback( err );
    } else {
      getVenues( urls, callback );
    }
  } );
};