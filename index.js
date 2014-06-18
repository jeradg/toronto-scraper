/* Uncomment the following two lines if debugging Mongoose. */
// var mongoose = require( 'mongoose' );
// mongoose.set( 'debug', true );

var path = require( 'path' ),
    fs = require( 'fs' ),
    minimist = require( 'minimist' ),
    mongoose = require( 'mongoose' ),
    database = require( './lib/database' ),
    scraper = require( './lib/scraper' );
    updateMetadata = require( './lib/updateMetadata' );

module.exports = scraper;

if ( require.main === module ) {
  // If run from the command line, accepts arguments:
  // `-p [path]` / `--path [path]` (optional): the path to a 
  //     JSON file containing an array of URLs.
  //     (If no path is provided, uses a default path.)
  // `-m` / '--meta' (optional): If true, only runs updateMetadata()

  var argv = minimist( process.argv.slice( 2 ), {
    alias: {
      "p": "path",
      "m": "meta"
    }
  } );

  if ( argv.meta ) {
    mongoose.connect( database );

    mongoose.connection.on( 'error', function( err ) {
      return console.log( err );
    } );

    mongoose.connection.on( 'open', function() {
      updateMetadata( function( err ) {
        if ( err ) {
          mongoose.connection.close( function() {
            return console.log( err );
          } );
        } else {
          mongoose.connection.close( function() {
            return false;
          } );
        }
      } );
    } );
  } else {
    var indexURLsPath = argv.path ? argv.path : path.resolve( __dirname, 'venueListURLs.json' ),
        urlsList = JSON.parse( fs.readFileSync( indexURLsPath ) );

    scraper( urlsList, function( err ) {
      if ( err ) {
        return console.log( 'Scrape failed with the following error: ', err );
      } else {
        return console.log( 'Scrape completed with no errors.' );
      }
    } );
  }
}