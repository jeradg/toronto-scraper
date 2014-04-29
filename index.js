/* index.js */

/* Uncomment the following two lines if debugging Mongoose. */
// var mongoose = require( 'mongoose' );
// mongoose.set( 'debug', true );

var path = require( 'path' ),
    argv = require( 'minimist' )( process.argv.slice( 2 ), {
    // User can pass an optional -e/--email flag when executing
    // from the command line. If present, the update module will
    // send a summary of 
      alias: {
        e: 'email'
      },
      default: {
        e: false
      }
    } ),
    swimTO = require( './lib/swimTO' ),
    urlsList = path.resolve( __dirname, 'venueListURLs.json' );

module.exports = swimTO;

swimTO().update( urlsList, { email: argv.e } );