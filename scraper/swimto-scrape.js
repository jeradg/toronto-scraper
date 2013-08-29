var cheerio = require( 'cheerio' ),
    request = require( 'request' ),
    async = require( 'async' ),
    fs = require( 'fs' ),
    mongo = require( 'mongo' ),
    mongoose = require( 'mongoose' ),
    // longjohn = require( 'longjohn' ), // Increases length of the stack trace. Helpful for debugging memory leaks.
    venueListURLs = [ 'http://www.toronto.ca/parks/prd/facilities/outdoor-pools/index.htm' ]; // ,
                      // 'http://www.toronto.ca/parks/prd/facilities/outdoor-pools/2-outdoor_pool.htm',
                      // 'http://www.toronto.ca/parks/prd/facilities/indoor-pools/index.htm',
                      // 'http://www.toronto.ca/parks/prd/facilities/indoor-pools/2-indoor_pool.htm' ];

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
        // Toronto.ca posts days of the week as these abbreviations.
        // We use these in requestURL() to determine if a particular date is this year, last year or next year.
        daysOfTheWeek = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
        thisYear = scrapeStartedDate.getFullYear(),
        lastYear = thisYear - 1,
        nextYear = thisYear + 1,
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

          // A week's schedule is contained in a div with an ID beginning with `dropin_Swimming`
          $( '[id^="dropin_Swimming"]' ).each( function() {
            // The `thead` contains one blank `th` (above the column with the swim types)
            // and seven `th`s with the dates for that week.
            var dates = [],
                activities = [],
                $thisRow,
                thisDate,
                thisActivity,
                thisAge,
                thisSession,
                sessionsSplit,
                times,
                am,
                pm,
                startTimeNum,
                endTimeNum,
                timesText;

            $( this ).find( 'th' ).each( function() {

              // Toronto.ca doesn't provide years in their schedule, so we have to figure out if a given date is this year,
              // last year or next year. (Esp. when December and January are in the schedule.) We do this by seeing if the day of the week
              // for the date matches the day of the week for that date this year. If not, we check next year, and if not that either, it's last year.
              if ( $( this ).text().length > 0 ) {
                var dateString = $( this ).text(),
                    dayOfTheWeekString = dateString.substr( 0, 3 ),
                    dayOfTheWeekNum,
                    dateThisYear = new Date( dateString.substr( 3 ) + ' ' + thisYear ),
                    dateLastYear = new Date( dateString.substr( 3 ) + ' ' + lastYear ),
                    dateNextYear = new Date( dateString.substr( 3 ) + ' ' + nextYear ),
                    date;

                for ( var i = 0; i < daysOfTheWeek.length; i++ ) {
                  if ( dayOfTheWeekString === daysOfTheWeek[ i ] ) {
                    dayOfTheWeekNum = i;
                  }
                }

                if ( dayOfTheWeekNum === dateThisYear.getDay() ) {
                  date = dateThisYear;
                } else if ( dayOfTheWeekNum === dateNextYear.getDay() ) {
                  date = dateNextYear;
                } else if ( dayOfTheWeekNum === dateNextYear.getDay() ) {
                  date = dateLastYear;
                }

                thisDate = {
                  date: date,
                  activities: []
                }

                dates.push( thisDate );
              }
            } );


            // Each `tr` contains the week's schedule for a given activity
            $( this ).find( 'tbody' ).find( 'tr' ).each( function() {
              var activityDayOfTheWeek = 0; // Keeps track of which day of the week is being processed. 0 is Sunday.
              $thisRow = $( this );
              thisActivity = {};
              thisActivity.activity = $( this ).find( '.coursetitlecol' ).text();
              // Regexes to format age restrictions
              thisActivity.age = $( this ).find( '.courseagecol' ).length > 0 ? $( this ).find( '.courseagecol' ).text().replace(/(\(|\))/gm, '').replace(/([0-9])(yrs)/gm, '$1 years') : '';
              thisActivity.sessions = [];
              
              $( this ).find( 'td' ).each( function() {

                if ( $( this ).find( '.coursetitlecol' ).length > 0 ) {
                  return true; // Skips to next object in .each() loop
                // Next we check for a <br> tag, which can signify that there are 
                // multiple sessions for the activity that day.
                } else {
                  if ( ( $( this ).find( 'br' ) ) && ( $( this ).html().trim().split( /<br>|<br \/>/ ).length > 1 ) ) {
                    // If the result of splitting on <br>s is more than one array item, 
                    // each array item is a session.
                    sessionsSplit = $( this ).html().trim().split( /<br>|<br \/>/ );
                    for ( var i = 0; i < sessionsSplit.length; i++ ) {
                      thisSession = {};
                      am = ( sessionsSplit[ i ].indexOf( 'am' ) !== -1 ) ? true : false;
                      pm = ( sessionsSplit[ i ].indexOf( 'pm' ) !== -1 ) ? true : false;
                      times = sessionsSplit[ i ].trim().split( ' - ' );
                      times[ 0 ] = times[ 0 ].replace( /[a-zA-Z]*/gm, '' );
                      times[ 1 ] = times[ 1 ].replace( /[a-zA-Z]*/gm, '' );

                      for ( var j = 0; j < times.length; j++ ) {
                        if ( times[ j ].indexOf( ':' ) !== -1 ) {
                          times[ j ] = times[ j ].split( ':' );
                          times[ j ][ 0 ] = parseInt( times[ j ][ 0 ], 10 );
                          times[ j ][ 1 ] = parseInt( times[ j ][ 1 ], 10 );
                        } else {
                          times[ j ] = [ parseInt( times[ j ], 10 ), '00' ];
                        }

                      if ( am && pm ) {
                        times[ 0 ][ 0 ] += 12;
                      } else if ( pm ) { // i.e., else if ( pm && !m )
                        times[ 0 ][ 0 ] += 12;
                        times[ 1 ][ 0 ] += 12;
                      } // If only am, don't add 12 because both hours are in the AM
if ( times[ j ][ 0 ] >= 24 ) {
  console.log( $( this ).html() );
}
                      }


                      // for ( var j = 0; j < times.length; j++ ) {
                      //   if ( times[ j ].indexOf( ':' ) !== -1 ) {
                      //     var hours = parseInt( times[ j ].split( ':' )[ 0 ], 10 ),
                      //         minutes = parseInt( times[ j ].split( ':' )[ 1 ], 10 );


                        //   if ( ( hours === 12 ) && ( pm === true ) ) {
                        //     times[ j ] = hours + ':' + minutes;
                        //   } else if ( ( j === 0 ) && ( am !== true ) ) {
                        //   // If the time we're processing is the start time and it's not in the AM or 12 PM,
                        //   // add 12 to the time (to put it on the 24-hour clock)
                        //     hours += 12;
                        //     times[ j ] = hours + ':' + minutes;
                        //   } else if ( ( j === 1 ) && ( pm === true ) ) {
                        //   // If the time we're processing is the end time and it's in the PM,
                        //   // add 12 to the time (to put it on the 24-hour clock)
                        //     hours += 12;
                        //     times[ j ] = hours + ':' + minutes;
                        //   }
                        // } else {
                        //   var hours = times[ j ];
                        //   if ( ( hours === 12 ) && ( pm === true ) ) {
                        //     times[ j ] = hours + ':00';
                        //   } else if ( ( j === 0 ) && ( am !== true ) ) {
                        //   // Same as above, but for times that don't contain ':' (i.e., that don't specify minutes)
                        //     hours = parseInt( hours, 10 ) + 12;
                        //     times[ j ] = hours + ':00';
                        //   } else if ( ( j === 1 ) && ( pm === true ) ) {
                        //     hours = parseInt( hours, 10 ) + 12;
                        //     times[ j ] = hours + ':00';
                        //   }
                        // }

                      thisSession.startTime = times[ 0 ][ 0 ] + ':' + times[ 0 ][ 1 ];
                      thisSession.endTime = times[ 1 ][ 0 ] + ':' + times[ 1 ][ 1 ];
                      thisActivity.sessions.push( thisSession );
                    }
                  }else if ( ( $( this ).html().replace( /&nbsp;*/gm, '' ).trim().length > 0 ) && ( $( this ).text().trim().length > 0 ) ) {
                    thisSession = {};
                    timesText = $( this ).text().trim();
                    am = ( timesText.indexOf( 'am' ) !== -1 ) ? true : false;
                    pm = ( timesText.indexOf( 'pm' ) !== -1 ) ? true : false;
                    times = $( this ).text().trim().split( ' - ' );
                    times[ 0 ] = times[ 0 ].replace( /[a-zA-Z]*/gm, '' );
                    times[ 1 ] = times[ 1 ].replace( /[a-zA-Z]*/gm, '' );

                    for ( var j = 0; j < times.length; j++ ) {
                      if ( times[ j ].indexOf( ':' ) !== -1 ) {
                        var hours = parseInt( times[ j ].split( ':' )[ 0 ], 10 ),
                            minutes = parseInt( times[ j ].split( ':' )[ 1 ], 10 );

                        if ( ( hours === 12 ) && ( pm === true ) ) {
                          times[ j ] = hours + ':' + minutes;
                        } else if ( ( j === 0 ) && ( am !== true ) ) {
                        // If the time we're processing is the start time and it's not in the AM or 12 PM,
                        // add 12 to the time (to put it on the 24-hour clock)
                          hours += 12;
                          times[ j ] = hours + ':' + minutes;
                        } else if ( ( j === 1 ) && ( pm === true ) ) {
                        // If the time we're processing is the end time and it's in the PM,
                        // add 12 to the time (to put it on the 24-hour clock)
                          hours += 12;
                          times[ j ] = hours + ':' + minutes;
                        }
                      } else {
                        var hours = parseInt( times[ j ], 10 );
                        if ( ( hours === 12 ) && ( pm === true ) ) {
                          times[ j ] = hours + ':00';
                        } else if ( ( j === 0 ) && ( am !== true ) ) {
                        // Same as above, but for times that don't contain ':' (i.e., that don't specify minutes)
                          hours = parseInt( hours, 10 ) + 12;
                          times[ j ] = hours + ':00';
                        } else if ( ( j === 1 ) && ( pm === true ) ) {
                          hours = parseInt( hours, 10 ) + 12;
                          times[ j ] = hours + ':00';
                        }
                      }
                    }

                    thisSession.startTime = times[ 0 ];
                    thisSession.endTime = times[ 1 ];
                    thisActivity.sessions.push( thisSession );
                  }
                  dates[ activityDayOfTheWeek ].activities.push( thisActivity );
                  activityDayOfTheWeek++; // See you tomorrow!
                }
              } );
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
