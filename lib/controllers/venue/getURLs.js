var cheerio = require( 'cheerio' ),
    request = require( 'request' ),
    async = require( 'async' );

module.exports = function ( indexURLs, callback ) {
  var venueURLs = [];

  function scrapeOne( url, callback ) {
    request( url, function( err, resp, body ) {
      if ( err ) {
        return err;
      } else {
        var $ = cheerio.load( body ),
            $links = $( '.pfrListing a' );

        if ( $links.length < 1 ) {
          var error = new Error( 'Could not find any venue links at ' + url );

          callback( error );
        } else {
          $links.each( function( i ) {
            venueURLs.push( 'http://' + resp.request.uri.hostname + $( this ).attr( 'href' ) );
          } );

          callback( null );
        }
      }
    } );
  }

  // Check if a valid array was passed as the first argument.
  if ( !Array.isArray( indexURLs ) ) {
    callback( new Error( 'first argument of venueController.getURLs must be an array of URLs' ) );
  // Check if the array has at least one member.
  } else if ( indexURLs.length < 1 ) {
    callback( new Error( 'first argument of venueController.getURLs must be an array with at least one URL' ) );
  } else {
    console.log( '\n\nGetting URLs...\n' );

    async.each( indexURLs, scrapeOne, function( err ) {
      callback( err, venueURLs );
    } );
  }
};