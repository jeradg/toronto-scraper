var cheerio = require( 'cheerio' ),
    request = require( 'request' ),
    async = require( 'async' ),
    fs = require( 'fs' ),
    // longjohn = require( 'longjohn' ), // Increases length of the stack trace. Helpful for debugging memory leaks.
    venueListURLs = [ 'http://www.toronto.ca/parks/prd/facilities/outdoor-pools/index.htm',
                      'http://www.toronto.ca/parks/prd/facilities/outdoor-pools/2-outdoor_pool.htm',
                      'http://www.toronto.ca/parks/prd/facilities/indoor-pools/index.htm',
                      'http://www.toronto.ca/parks/prd/facilities/indoor-pools/2-indoor_pool.htm' ];

function swimTOUpdate( venueListURLs ) {
  var scrapeStartedDate = new Date(),
      rootPath = 'output/',
      tempPath = rootPath + 'temp/',
      linksPath = rootPath + 'links/',
      dataPath = rootPath + 'data/',
      prefix = 'swimto_',
      suffix = scrapeStartedDate.getFullYear() + '_'
               + ( scrapeStartedDate.getMonth() + 1 ) + '_'
               + scrapeStartedDate.getDate() + '_'
               + ( scrapeStartedDate.getHours() > 10 ? scrapeStartedDate.getHours() : '0' + scrapeStartedDate.getHours() )
               + ( scrapeStartedDate.getMinutes() > 10 ? scrapeStartedDate.getMinutes() : '0' + scrapeStartedDate.getMinutes() )
               + ( scrapeStartedDate.getSeconds() > 10 ? scrapeStartedDate.getSeconds() : '0' + scrapeStartedDate.getSeconds() );
      tempLinksFile = tempPath + prefix + 'links_' + suffix + '_TEMP.json',
      linksFile =  linksPath + prefix + 'links_' + suffix + '.json',
      tempDataFile = tempPath + prefix + 'data_' + suffix + '_TEMP.json',
      dataFile =  dataPath + prefix + 'data_' + suffix + '.json';

  function getVenueURLs( venueListURLs, callback ) {

    var venueListURLs = venueListURLs,
        json = {},
        callbackCounter = 0,
        links;

    console.log( '\n\nGetting URLs...\n' );

    for ( var i = 0; i < venueListURLs.length; i++ ) {
      request( venueListURLs[ i ], function( err, resp, body ) {
        if ( err ) return console.log( 'ERROR: While trying to request the URL ' + url + ', there was the following error: \n' + err );

        var $ = cheerio.load( body ),
            $links = $( '.pfrListing a' ),
            links = '';

        $links.each( function() {
          links += '"http://toronto.ca' + $( this ).attr( 'href' ) + '"\n';
        } );

        fs.appendFileSync( tempLinksFile, links );
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
      linksScratch = fs.readFileSync( tempLinksFile ).toString().split( '\n' ).join( ',' );

      fs.unlinkSync( tempLinksFile );

      links = eval( '[' + linksScratch +  ']' );

      json.links = links;

      var outputFile = fs.createWriteStream( linksFile ),
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
    var urls = JSON.parse( fs.readFileSync( linksFile ) ).links,
        json = {
                data : {}
              },
        data = json.data,
        pools,
        callbackCounter = 0; //,
        q = async.queue( function( task, callback ) {
          requestURL( task.url );
          callback();
        }, 5 );

    console.log( '\nScraping...\n' );

    function requestURL( url ) {
      request( url, function( err, resp, body ) {
        if ( err ) return console.log( 'ERROR: While trying to request the URL ' + url + ', there was the following error: \n' + err );

        var $ = cheerio.load( body ),
            thisPool = {};

        // Only gather information about pools with drop-in swimming (as opposed to registration-only programmes)
        if ( $( '[id^="dropin_Swimming"]' ).length > 0 ) {
          
          // The regex removes newlines and tabs from the pool name
          thisPool.pool = $( '.wrapper h1' ).text().replace(/(\r\n|\n|\r|\t)/gm, '');
          thisPool.url = resp.request.href;
          // The second regex replaces double spaces in the description with single spaces
          thisPool.description = $( '#pfrComplexDescr p' ).text().replace(/(\r\n|\n|\r|\t)/gm, '').trim().replace(/(\s\s)/gm, ' ');
          thisPool.address = $( '.pfrComplexLocation ul li:nth-child(1)' ).text().trim();
          thisPool.phone = $( '.pfrComplexLocation ul li:contains("Contact Us:")' ).text().trim().replace(/[^0-9]/gm, '');
          thisPool.accessibility = $( '.pfrComplexLocation ul li:contains(" Accessible")' ).text().trim();
          thisPool.ward = $( '.pfrComplexLocation ul li:contains("Ward:")' ).text().trim().replace(/Ward: /gm, '');
          thisPool.district = $( '.pfrComplexLocation ul li:contains("District:")' ).text().trim().replace(/District: /gm, '');
          thisPool.intersection = $( '.pfrComplexLocation ul li:contains("Near:")' ).text().trim().replace(/Near: /gm, '');
          thisPool.transit = $( '.pfrComplexLocation ul li:contains("TTC Information:")' ).text().trim().replace(/TTC Information: /gm, '').replace(/\s\s/gm, ' ');
          thisPool.schedule = [];

          $( '[id^="dropin_Swimming"]' ).each( function() {
            // The `thead` contains one blank `th` (above the column with the swim types)
            // and seven `th`s with the dates for that week.
            var dates = [],
                activities = [],
                thisDate,
                thisActivity,
                thisAge;

            $( this ).find( 'th' ).each( function() {
              if ( $( this ).text().length > 0 ) {
                thisDate = {
                  date: $( this ).text(),
                  activities: []
                }
                dates.push( thisDate );
              }
            } );

            // Each `tr` contains the week's schedule for a given activity
            $( this ).find( 'tbody' ).find( 'tr' ).each( function() {
              thisActivity = $( this ).find( '.coursetitlecol' ).text();
              // Regexes to format age restrictions
              thisAge = $( this ).find( '.courseagecol' ).length > 0 ? $( this ).find( '.courseagecol' ).text().replace(/(\(|\))/gm, '').replace(/([0-9])(yrs)/gm, '$1 years') : undefined;
            } );

            thisPool.schedule = thisPool.schedule.concat( dates );
          } );

          fs.appendFile( tempDataFile, JSON.stringify( thisPool ) + '\n', function( error ) {
            if ( error ) throw error;
            requestCallback();
          } );

        } else {

          // If there are no drop-in swimming programmes, fire the request callback
          requestCallback();

        }
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
      console.log( '\nCreating data file...\n' )

      var poolsScratch = fs.readFileSync( tempDataFile ).toString().split( '\n' );

      fs.unlinkSync( tempDataFile );

      pools = eval( '[' + poolsScratch +  ']' );

      data.pools = pools;

      var outputFile = fs.createWriteStream( dataFile ),
          scrapeCompletedDate = new Date();

      outputFile.on( 'open', function( fd ) {
        data[ 'scrapeStarted' ] = scrapeStartedDate.toISOString();
        data[ 'scrapeCompleted' ] = scrapeCompletedDate.toISOString()
        outputFile.write( JSON.stringify( json ) );
      } );

      console.log( '\n' +
                   '------------------------------\n' +
                   'Scrape completed.\n' );
    }

    var urlsQueue = urls.slice( 0 ); // Creates a shallow copy of the `urls` array

    for ( var i = 0; i < urls.length; i++ ) {
      // requestURL( urls[ i ] );
      q.push( { url: urls[ i ] } );
    }

  }

  getVenueURLs( venueListURLs, writeJSON );

}

swimTOUpdate( venueListURLs );
