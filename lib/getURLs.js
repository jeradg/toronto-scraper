var exports = module.exports = getURLs,
    cheerio = require( 'cheerio' ),
    request = require( 'request' ),
    async = require( 'async' ),
    helpers = require( './helpers' );

function getURLs( indexURLs, callback ) {
  var venueURLs = [];

  if ( !Array.isArray( indexURLs ) ) {
    var error = new Error( 'first argument of getURLs must be an array of URLs' );

    callback( error );
  } else if ( indexURLs.length < 1 ) {
    var error = new Error( 'first argument of getURLs must be an array with at least one URL' );

    callback( error );
  } else {
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

    console.log( '\n\nGetting URLs...\n' );

    async.each( indexURLs, scrapeOne, function( err ) {
      callback( err, venueURLs );
    } );
  }
}