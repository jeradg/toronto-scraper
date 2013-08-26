// TODO: Note whether a pool is outdoor or indoor

var cheerio = require( 'cheerio' ),
    request = require( 'request' ),
    async = require( 'async' ),
    fs = require( 'fs' ),
    scrapeStartedDate = new Date(),
    path = 'output/',
    prefix = 'swimto_',
    suffix = scrapeStartedDate.getFullYear() + '_'
             + ( scrapeStartedDate.getMonth() + 1 ) + '_'
             + scrapeStartedDate.getDate() + '_'
             + ( scrapeStartedDate.getHours() > 10 ? scrapeStartedDate.getHours() : '0' + scrapeStartedDate.getHours() )
             + ( scrapeStartedDate.getMinutes() > 10 ? scrapeStartedDate.getMinutes() : '0' + scrapeStartedDate.getMinutes() )
             + ( scrapeStartedDate.getSeconds() > 10 ? scrapeStartedDate.getSeconds() : '0' + scrapeStartedDate.getSeconds() );
    tempLinksFilePath = path + prefix + 'links_' + suffix + '_TEMP.json',
    linksFilePath =  path + prefix + 'links_' + suffix + '.json',
    tempDataFilePath = path + prefix + 'data_' + suffix + '_TEMP.json',
    dataFilePath =  path + prefix + 'data_' + suffix + '.json',
    venueListURLs = [ 'http://www.toronto.ca/parks/prd/facilities/outdoor-pools/index.htm',
                      'http://www.toronto.ca/parks/prd/facilities/outdoor-pools/2-outdoor_pool.htm' ];

function swimTOUpdate( venueListURLs ) {

  function getVenueURLs( venueListURLs, callback ) {

    var venueListURLs = venueListURLs,
        json = {},
        callbackCounter = 0,
        links;

    for ( var i = 0; i < venueListURLs.length; i++ ) {
      request( venueListURLs[ i ], function( err, resp, body ) {
        if ( err ) return console.log( 'ERROR: While trying to request the URL ' + url + ', there was the following error: \n' + err );

        var $ = cheerio.load( body ),
            $links = $( '.pfrListing a' ),
            links = '';

        $links.each( function() {
          links += '"http://toronto.ca' + $(this).attr( 'href' ) + '"\n';
        });

        fs.appendFileSync( tempLinksFilePath, links );
        requestCallback();
       } );
    }

    // If all of the URLs have been scraped, finish processing.
    // If there are still URLs to scrape, increment the counter.
    function requestCallback() {
      if ( callbackCounter === venueListURLs.length - 1 ) {
        finish();
      }
      callbackCounter++;
    }

    function finish() {
      linksScratch = fs.readFileSync( tempLinksFilePath ).toString().split( '\n' ).join( ',' );

      fs.unlinkSync( tempLinksFilePath );

      links = eval( '[' + linksScratch +  ']' );

      json.links = links;

      var outputFile = fs.createWriteStream( linksFilePath ),
          scrapeCompletedDate = new Date();

      outputFile.on( 'open', function( fd ) {
        json[ 'scrapeStarted' ] = scrapeStartedDate.toISOString();
        json[ 'scrapeCompleted' ] = scrapeCompletedDate.toISOString()
        outputFile.write( JSON.stringify( json ) );
        callback();
      } );
  
    }

  }

  function writeJSON() {
// console.log( fs.readFileSync( linksFilePath ).toString() );
    var urls = JSON.parse( fs.readFileSync( linksFilePath ) ).links,
        json = {
                data : {}
              },
        data = json.data,
        pools,
        callbackCounter = 0; //,
        // q = async.queue( function( task ) {
        //   requestURL( task.url );
        // }, 5 );

    function requestURL( url ) {
      request( url, function( err, resp, body ) {
        if ( err ) return console.log( 'ERROR: While trying to request the URL ' + url + ', there was the following error: \n' + err );

        var $ = cheerio.load( body ),
            thisPool = {},
            $swimmingSchedule = $( '[id^="dropin_Swimming"]' );
        
        // The regex removes newlines and tabs from the pool name
        thisPool.pool = $( '.wrapper h1' ).text().replace(/(\r\n|\n|\r|\t)/gm, '');
        thisPool.url = resp.request.href;
        // The second regex replaces double spaces in the description with single spaces
        thisPool.description = $( '#pfrComplexDescr p' ).text().replace(/(\r\n|\n|\r|\t)/gm, '').trim().replace(/(\s\s)/gm, ' ');
        thisPool.address = $( '.pfrComplexLocation ul li:nth-child(1)' ).text().trim();
        thisPool.phone = $( '.pfrComplexLocation ul li:contains("Contact Us:")' ).text().trim().replace(/[^0-9]/gm, '');
        // thisPool.accessibility = $( '.pfrComplexLocation ul li:nth-child(3)' ).text().trim();
        thisPool.ward = $( '.pfrComplexLocation ul li:contains("Ward:")' ).text().trim().replace(/Ward: /gm, '');
        thisPool.district = $( '.pfrComplexLocation ul li:contains("District:")' ).text().trim().replace(/District: /gm, '');
        thisPool.intersection = $( '.pfrComplexLocation ul li:contains("Near:")' ).text().trim().replace(/Near: /gm, '');
        thisPool.transit = $( '.pfrComplexLocation ul li:contains("TTC Information:")' ).text().trim().replace(/TTC Information: /gm, '').replace(/\s\s/gm, ' ');
        thisPool.schedule = [];

        $swimmingSchedule.each( function() {
          // The `thead` contains one blank `th` (above the column with the swim types)
          // and seven `th`s with the dates for that week.
          $( this ).find( 'th' ).each( function() {
            // console.log( $( this ).text() );
          } );

          // Each `tr` contains the week's schedule for a given activity
          $( this ).find( 'tr' ).each( function() {

          } );
        } );

        fs.appendFile( tempDataFilePath, JSON.stringify( thisPool ) + '\n', function( error ) {
          if ( error ) throw error;
          requestCallback();
        } );
      } );
    }

    // If all of the URLs have been scraped, finish processing.
    // If there are still URLs to scrape, increment the counter.
    function requestCallback() {
      if ( callbackCounter === urls.length - 1 ) {
        finish();
      }
      callbackCounter++;
    }

    function finish() {
      var poolsScratch = fs.readFileSync( tempDataFilePath ).toString().split( '\n' );

      fs.unlinkSync( tempDataFilePath );

      pools = eval( '[' + poolsScratch +  ']' );

      data.pools = pools;

      var outputFile = fs.createWriteStream( dataFilePath ),
          scrapeCompletedDate = new Date();

      outputFile.on( 'open', function( fd ) {
        data[ 'scrapeStarted' ] = scrapeStartedDate.toISOString();
        data[ 'scrapeCompleted' ] = scrapeCompletedDate.toISOString()
        outputFile.write( JSON.stringify( json ) );
      } );
    }

    for ( var i = 0; i < urls.length; i++ ) {
      requestURL( urls[ i ] );
      // q.push( { url: urls[ i ] } );
    }

  }

  getVenueURLs( venueListURLs, writeJSON );

}


swimTOUpdate( venueListURLs );
