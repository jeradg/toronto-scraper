var exports = module.exports = updateVenues,
    mongoose = require( 'mongoose' ),
    request = require( 'request' ),
    cheerio = require( 'cheerio' ),
    async = require( 'async' ),
    database = require( './database' ),
    helpers = require( './helpers' ),
    updateMetadata = require( './updateMetadata' ),
    requestURL = require( './requestURL' ),
    VenueModel = require( './models/venueModel' );

// After the venue URLs are gathered, we crawl them for scheduling info
function updateVenues( urls ) {
  var finishCounter = { counter: 0 },
      // Create the queue
      q = async.queue( function( task, callback ) {
        requestURL( task.url, function() {
          helpers.callbackCounter( finishCounter, urls.length, finish );
        } );
        callback();
      }, 5 );

  function finish() {
    console.log( '\n' +
                 '------------------------------\n' +
                 'Crawl completed.\n' );

    updateMetadata();
  }

  mongoose.connect( database );

  mongoose.connection.on( 'error', function( error ) { return console.log( error ) } );

  mongoose.connection.on( 'open', function() {
    console.log( '\nCrawling...\n' );

    var urlsQueue = urls.slice( 0 ); // Creates a shallow copy of the `urls` array
    
    for ( var i = 0; i < urls.length; i++ ) {
      q.push( { url: urls[ i ] } );
    }
  } );
}