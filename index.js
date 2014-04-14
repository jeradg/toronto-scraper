/* index.js */

/* Uncomment the following two lines if debugging Mongoose. */
// var mongoose = require( 'mongoose' );
// mongoose.set( 'debug', true );

var path = require( 'path' ),
    swimTO = require( './lib/swimTO' ),
    urlsList = path.resolve( __dirname, 'venueListURLs.json' );

module.exports = swimTO;

swimTO().update( urlsList );