var exports = module.exports = getURLs,
    cheerio = require( 'cheerio' ),
    request = require( 'request' ),
    helpers = require( './helpers' );

function getURLs( urls, callback ) {
console.log(  urls);
  var finishCounter = { counter: 0 },
      links = [];

  console.log( '\n\nGetting URLs...\n' );

  for ( var i = 0; i < urls.length; i++ ) {
    var url = urls[ i ];

    request( url, function( error, resp, body ) {
      if ( !error ) {
        var $ = cheerio.load( body ),
            $links = $( '.pfrListing a' );

        $links.each( function() {
          links.push( 'http://' + resp.request.uri.hostname + $( this ).attr( 'href' ) );
        } );
        if ( $links.length > 0 ) {
          helpers.callbackCounter( finishCounter, urls.length, callback, links );
        } else {
          return console.log( 'Error: Could not find any venue links at ' + url );
        }
      } else {
        return console.log( 'ERROR: While trying to request the URL ' + url + ', there was the following error: \n' + error );
      }
    } );
  }
}
