var cheerio = require( 'cheerio' ),
    request = require( 'request' ),
    async = require( 'async' ),
    fs = require( 'fs' ),
    mongoose = require( 'mongoose' ),
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

  function getVenueURLs( urls, callback ) {
    var json = {},
        callbackCounter = 0,
        links;

    console.log( '\n\nGetting URLs...\n' );

    for ( var i = 0; i < urls.length; i++ ) {
      request( urls[ i ], function( error, resp, body ) {
        if ( !error ) {
          var $ = cheerio.load( body ),
              $links = $( '.pfrListing a' ),
              links = '';

          $links.each( function() {
            links += '"http://toronto.ca' + $( this ).attr( 'href' ) + '"\n';
          } );

          fs.appendFileSync( tempLinksFile, links );
          if ( $links !== undefined ) {
            requestCallback();
          } else {
            return console.log( 'Error: Could not find any venue links at ' + urls[ i ] );
          }
        } else {
          return console.log( 'ERROR: While trying to request the URL ' + url + ', there was the following error: \n' + error );
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

  function updateDatabase() {
    var urls = JSON.parse( fs.readFileSync( linksFile ) ).links,
        // Schema
        Venue = new mongoose.Schema( {
          name: String,
          url: String,
          description: String,
          address: String,
          latitude: Number,
          longitude: Number,
          phone: Number,
          accessibility: String,
          ward: Number,
          district: String,
          intersection: String,
          transit: String,
          schedule: [ { 
            activity: String,
            age: String,
            sessions: [ {
              startTime: Date,
              endTime: Date
            } ]
          } ]
        } ),
        // Model
        VenueModel = mongoose.model( 'Venue', Venue ),
        venues,
        // Toronto.ca posts days of the week as these abbreviations.
        // We use these in requestURL() to determine if a particular date is this year, last year or next year.
        daysOfTheWeek = [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
        thisYear = scrapeStartedDate.getFullYear(),
        lastYear = thisYear - 1,
        nextYear = thisYear + 1,
        callbackCounter = 0, //,
        q = async.queue( function( task, callback ) {
          requestURL( task.url );
          callback();
        }, 5 );
    mongoose.connect( 'mongodb://localhost/toapi' );

    console.log( '\nScraping...\n' );

    function processTimes( dateObject, rawTimeRange, activity ) {
      var thisSession = {},
          am = ( rawTimeRange.indexOf( 'am' ) !== -1 ) ? true : false,
          pm = ( rawTimeRange.indexOf( 'pm' ) !== -1 ) ? true : false,
          thisMonth = dateObject.getMonth() < 9 ? ( '0' + ( dateObject.getMonth() + 1 ) ) : dateObject.getMonth() + 1,
          thisDate = dateObject.getDate() < 10 ? ( '0' + dateObject.getDate() ) : dateObject.getDate(),
          thisFullDate = dateObject.getFullYear() + '-' + thisMonth + '-' + thisDate,
          offset = new Date().getTimezoneOffset(),
          times = rawTimeRange.trim().split( ' - ' );
// console.log( offset / 60 );
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
      }

      if ( am && pm ) { // If one of the times is in the AM and the other is PM, add
        times[ 1 ][ 0 ] = times[ 1 ][ 0 ] === 12 ? times[ 1 ][ 0 ] : times[ 1 ][ 0 ] + 12;
      } else if ( pm ) { // i.e., else if ( pm && !am )
        times[ 0 ][ 0 ] = times[ 0 ][ 0 ] === 12 ? times[ 0 ][ 0 ] : times[ 0 ][ 0 ] + 12;
        times[ 1 ][ 0 ] = times[ 1 ][ 0 ] === 12 ? times[ 1 ][ 0 ] : times[ 1 ][ 0 ] + 12;
      } // If only am, don't add 12 because both hours are in the AM

      // If the hour or minute needs a leading 0, add it
      for ( var j = 0; j < times.length; j++ ) {
        for ( var k = 0; k < times[ j ].length; k++ ) {
          if ( times[ j ][ k ].toString().length === 1 ) {
            times[ j ][ k ] = '0' + times[ j ][ k ];
          }
        }
      }

      thisSession.startTime = new Date( thisFullDate + 'T' + times[ 0 ][ 0 ] + ':' + times[ 0 ][ 1 ] + ':00-04:00' );
      thisSession.endTime = new Date( thisFullDate + 'T' + times[ 1 ][ 0 ] + ':' + times[ 1 ][ 1 ] + ':00-04:00' );
      if ( thisSession.startTime == 'Invalid Date' ) {
        console.log( 'ERROR - Invalid date: ' + thisFullDate + 'T' + times[ 0 ][ 0 ] + ':' + times[ 0 ][ 1 ] + ':00-04:00' );
      } else {
        activity.sessions.push( thisSession );
      }
    }

    function getLatLong( address ) {
      // To deal with error on http://www.toronto.ca/parks/prd/facilities/complex/1317/
      // Toronto Parks was emailed about the error on 6 Sept 2013
      if ( address === '145 Guildwood Pky MIE 1P5' ) {
        address = '145 Guildwood Pky M1E 1P5';
      }
      var latLong = {},
          addressRegex = /([0-9]*\s*?[0-9\/]*?)(?:\s*)([A-Za-z.\s]*(?=[A-Za-z][0-9][A-Za-z](?:\s)?[0-9][A-Za-z][0-9]))([A-Za-z][0-9][A-Za-z])(?:\s)?([0-9][A-Za-z][0-9])/,
          addressArray = address.match( addressRegex );

      if ( addressArray ) {
        var streetNumber = addressArray[ 1 ].trim().replace(/\s{2,}/g, ' '),
            streetName = addressArray[ 2 ].trim().replace(/\s{2,}/g, ' '),
            postalCode = addressArray[ 3 ] + addressArray[ 4 ],
            geocodeURL = 'http://geocoder.ca/?' + 'stno=' + streetNumber.replace( /\//g, '%2F' ) + '&addresst=' + streetName + '&city=Toronto&province=ON&postal=' + postalCode,
            geocodeURLEscaped = geocodeURL.replace( /\s/g, '%20' );
      } else {
        if( !addressArray ) {
          console.log( 'getLatLong failed for the following address:\n' + address );
        }
      }

      // request( geocodeURLEscaped, function( error, response, body ) {

      // } );

// var latLong = {};
      // latLong.latitude = 0;
      latLong.longitude = 0;

      return latLong;
    }

    function requestURL( url ) {
      request( url, function( error, resp, body ) {
        if ( !error ) {

          var $ = cheerio.load( body ),
              thisVenue = {},
              id = undefined;

          // Only gather information about venues with drop-in swimming (as opposed to registration-only programmes)
          if ( $( '[id^="dropin_Swimming"]' ).length > 0 ) {
            
            // The regex removes newlines and tabs from the venue name.
            thisVenue.name = $( '.wrapper h1' ).text().replace( /(\r\n|\n|\r|\t)/gm, '' ).replace( /([ \t\r\n][ \t\r\n]*)/, ' ' ).trim();
            thisVenue.url = resp.request.href;
            thisVenue.schedule = [];

            // A week's schedule is contained in a div with an ID beginning with `dropin_Swimming`
            $( '[id^="dropin_Swimming"]' ).each( function() {
              // The `thead` contains one blank `th` (above the column with the swim types)
              // and seven `th`s with the dates for that week.
              var dates = [],
                  schedule = [],
                  $thisRow,
                  thisDate,
                  thisAge,
                  sessionsSplit,
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

                  dates.push( date );
                }
              } );

              // Each `tr` contains the week's schedule for a given activity
              $( this ).find( 'tbody' ).find( 'tr' ).each( function() {
                var $thisRow = $( this ),
                    activityName = $thisRow.find( '.coursetitlecol' ).text().trim(),
                    activityNumber;

                // See if this activity is already in the schedule
                for ( var i = 0; i < schedule.length; i++ ) {
                  if ( activityName = schedule[ i ].activity ) return activityNumber = i;
                }

                // If the activity isn't already in the schedule, add it
                if ( !activityNumber ) {
                  schedule.push( {
                    activity: activityName,
                    age: $thisRow.find( '.courseagecol' ).length > 0 ? $( this ).find( '.courseagecol' ).text().replace( /(\(|\))/gm, '' ).replace( /([0-9])(yrs)/gm, '$1 years' ) : '',
                    sessions: []
                  } );

                  activityNumber = schedule.length - 1;
                }
                
                $( this ).find( 'td' ).each( function( column ) {
                  // Regexes to format age restrictions

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
                        processTimes( dates[ column - 1 ], sessionsSplit[ i ], schedule[ activityNumber ] );
                      }
                    } else if ( ( $( this ).html().replace( /&nbsp;*/gm, '' ).trim().length > 0 ) && ( $( this ).text().trim().length > 0 ) ) {
                      processTimes( dates[ column - 1 ], $( this ).text().trim(), schedule[ activityNumber ] );
                    }
                  }
                } );
              } );         
            } );

            function updateVenue( someVenue ) {
              VenueModel.update( { '_id': mongoose.Types.ObjectId( id ) }, { schedule: thisVenue.schedule }, function( error, venue ) {
                if ( !error ) {
                  console.log( 'Updated ' + someVenue.name );          
                  requestCallback();
                } else {
                  return console.log( error );
                }
              } );
            }

            function createVenue() {
              var latLong;

              // The second regex replaces double spaces in the description with single spaces.
              thisVenue.description = $( '#pfrComplexDescr p' ).text().replace( /(\r\n|\n|\r|\t)/gm, '' ).trim().replace( /(\s\s)/gm, ' ' );
              thisVenue.address = $( '.pfrComplexLocation ul li:nth-child(1)' ).text().trim();
              latLong = getLatLong( thisVenue.address );
              thisVenue.latitude = latLong.latitude;
              thisVenue.longitude = latLong.longitude;
// console.log ( thisVenue.latitude + ', ' + thisVenue.longitude );
              // The regex adds hyphens to phone numbers.
              thisVenue.phone = parseInt( $( '.pfrComplexLocation ul li:contains("Contact Us:")' ).text().replace( /[^0-9]/gm, '' ), 10 );
              thisVenue.accessibility = $( '.pfrComplexLocation ul li:contains(" Accessible")' ).text().trim();
              thisVenue.ward = parseInt( $( '.pfrComplexLocation ul li:contains("Ward:")' ).text().replace( /Ward: /gm, '' ), 10 );
              thisVenue.district = $( '.pfrComplexLocation ul li:contains("District:")' ).text().trim().replace( /District: /gm, '' );
              thisVenue.intersection = $( '.pfrComplexLocation ul li:contains("Near:")' ).text().trim().replace( /Near: /gm, '' );
              thisVenue.transit = $( '.pfrComplexLocation ul li:contains("TTC Information:")' ).text().trim().replace( /TTC Information: /gm, '' ).replace( /\s\s/gm, ' ' );
// console.log( thisVenue.address );
              VenueModel.create(
                {
                  name: thisVenue.name,
                  url: thisVenue.url,
                  description: thisVenue.description,
                  address: thisVenue.address,
                  phone: thisVenue.phone || 4163384386, // Defaults to recreation department's customer service line
                  accessibility: thisVenue.accessibility,
                  ward: thisVenue.ward || 0, // Defaults to 0
                  district: thisVenue.district,
                  intersection: thisVenue.intersection,
                  transit: thisVenue.transit,
                  schedule: thisVenue.schedule
                }, function( error, venue ) {
                  if ( !error ) {
                    // console.log( 'Created ' + venue.name );
                    requestCallback();
                  } else {
                    return console.log( error );
                  }
                }
              );
            }
            // If the venue already exists in the database, get its _id
            VenueModel.findOne( { 'name': thisVenue.name }, function( error, venue ) {
              if ( !error ) {
                if ( venue ) {
                  updateVenue( venue );
                } else {
                  createVenue();
                }
              } else {
                return console.log( error );
              }
            } );
            // If the venue already exists in the database, update its schedule

          } else {
            // If there are no drop-in swimming programmes, fire the request callback
            requestCallback();
          }
        
        } else {
          console.log( 'ERROR: While trying to request the URL ' + url + ', there was the following error: \n' + error );
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
      console.log( '\n' +
                   '------------------------------\n' +
                   'Scrape completed.\n' );

// FOR TESTING: Drop the collection after adding it
mongoose.connection.db.dropCollection( 'venues' );
      
      mongoose.connection.close();
    }

    var urlsQueue = urls.slice( 0 ); // Creates a shallow copy of the `urls` array
    for ( var i = 0; i < urls.length; i++ ) {
      q.push( { url: urls[ i ] } );
    }

  }

  getVenueURLs( venueListURLs, updateDatabase );

}

swimTOUpdate( venueListURLs );
