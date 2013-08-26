var cheerio = require( 'cheerio' );
var request = require( 'request' );
var fs = require( 'fs' );

function scrape( url ) {
  var json = {
        data : {
          venues: []
        }
      },
      data = json.data,
      venues = data.venues,
      scrapeStartDate = new Date();

  data[ 'scrapeStarted' ] = scrapeStartDate.toISOString();

  function doTheHTMLStuff( err, resp, body ) {
    if ( err ) { return console.log( 'Error: ' + err ); }

    $ = cheerio.load( body );

    var thisVenue = {},
        $swimmingSchedule = $( '[id^="dropin_Swimming"]' );

    thisVenue.venue = $( '.wrapper h1' ).text();
console.log( thisVenue.venue );
    $swimmingSchedule.each( function() {

      $( this ).find( 'th' ).each( function() {
        console.log( $( this ).text() );
      } );

      $( this ).find( 'tr' ).each( function() {

      } );

    } );

    return venues.push( thisVenue );

  }

  request( url, doTheHTMLStuff );

  var scrapeCompletedDate = new Date();
  data[ 'scrapeCompleted' ] = scrapeCompletedDate.toISOString();

  var outputFile = fs.createWriteStream( 'output/swimto_data_' + scrapeCompletedDate.getFullYear() + '-' + ( scrapeCompletedDate.getMonth() + 1 ) + '-' + scrapeCompletedDate.getDate() + '-T' + ( scrapeCompletedDate.getHours() > 10 ? scrapeCompletedDate.getHours() : '0' + scrapeCompletedDate.getHours() ) + ( scrapeCompletedDate.getMinutes() > 10 ? scrapeCompletedDate.getMinutes() : '0' + scrapeCompletedDate.getMinutes() ) + ( scrapeCompletedDate.getSeconds() > 10 ? scrapeCompletedDate.getSeconds() : '0' + scrapeCompletedDate.getSeconds() ) + '.json' );

  outputFile.on( 'open', function( fd ) {
    outputFile.write( JSON.stringify( json ) );
  } );
}

// scrape( 'http://www.toronto.ca/parks/prd/facilities/complex/523/index.htm' );
scrape( 'http://www.toronto.ca/parks/prd/facilities/complex/414/index.htm' );
