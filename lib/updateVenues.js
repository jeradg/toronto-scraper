var exports = module.exports = updateVenues,
    mongoose = require( 'mongoose' ),
    request = require( 'request' ),
    cheerio = require( 'cheerio' ),
    async = require( 'async' ),
    database = require( './database' ),
    scrapeVenue = require( './scrapeVenue' ),
    writeVenue = require( './writeVenue' ),
    VenueModel = require( './models/venueModel' ),
    updateMetadata = require( './updateMetadata' );

// After the venue URLs are gathered, we crawl them for scheduling info
function updateVenues( urls, callback ) {
  function updateOne( url, callback ) {
    scrapeVenue( url, function( err, venue ) {
      if ( err ) {
        callback( err );
      } else {
        if ( venue ) {
          writeVenue( venue, callback );
        } else {
          callback( null );
        }
      }
    } );
  }

  function finish( callback ) {
    console.log( '\n' +
                 '------------------------------\n' +
                 'Crawl completed.\n' );

    updateMetadata( function( err ) {
      if ( err ) {
        mongoose.connection.close( function() {
          callback( err );
        } );
      } else {
        mongoose.connection.close( function() {
          callback( null );
        } );
      }
    } );
  }

  mongoose.connect( database );

  mongoose.connection.on( 'error', function( err ) {
    callback( err );
  } );

  mongoose.connection.on( 'open', function() {
    console.log( '\nCrawling...\n' );

    // Use eachLimit() instead of each() to avoid
    // errors from having too many open connections
    async.eachLimit( urls, 10, updateOne, function( err ) {
      if ( err ) {
        callback( err );
      } else {
        finish( callback );
      }
    } );
  } );
}