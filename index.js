/* Uncomment the following two lines if debugging Mongoose. */
// var mongoose = require( 'mongoose' );
// mongoose.set( 'debug', true );

var path = require( 'path' ),
    fs = require( 'fs' ),
    scraper = require( './lib/scraper' );

module.exports = scraper;

if ( require.main === module ) {
  // If run from the command line, accepts one optional argument,
  // the path to a JSON file containing an array of URLs.
  // If no arguments given, uses a default path.
  var args = process.argv.slice( 2 ),
      indexURLsPath = args[ 0 ] ? args[ 0 ] : path.resolve( __dirname, 'venueListURLs.json' ),
      urlsList = JSON.parse( fs.readFileSync( indexURLsPath ) );

  scraper( urlsList, function( err ) {
    if ( err ) {
      console.log( 'Scrape failed with the following error: ', err );
    } else {
      console.log( 'Scrape completed with no errors.' )
    }
  } );
}