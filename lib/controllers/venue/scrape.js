var request = require( 'request' ),
    cheerio = require( 'cheerio' ),
    cleaner = require( '../../helpers/cleaner' );

module.exports = function( url, callback ) {
  function processRow( $, $row, dates, venue ) {
    var rawAge = $row.find( '.courseagecol' ).length > 0 ?
          $row.find( '.courseagecol' ).text() :
          undefined,
        activity = cleaner.activity( $row.find( '.coursetitlecol' ).text(), rawAge ),
        activityName = activity[ 0 ],
        activityType = activity[ 1 ],
        age = activity[ 2 ];

    $row.find( 'td' ).each( function( column ) {
      var sessions = null,
          i;

      if ( $( this ).find( '.coursetitlecol' ).length > 0 ) {
        // If the td is the name of the activity,
        // skip to next object in the .each() loop.
        return true;
      } else {
        // Next we check for a <br> tag, which can signify that there are 
        // multiple sessions for the activity that day.
        if ( ( $( this ).find( 'br' ) ) && ( $( this ).html().trim().split( /<br>|<br \/>/ ).length > 1 ) ) {
          // If the result of splitting on <br>s is more than one array item, 
          // each array item is a session.
          sessions = $( this ).html().trim().split( /<br>|<br \/>/ );

          // Remove empty strings from the sessions array
          for ( i = 0; i < sessions.length; i++ ) {
            if ( sessions[ i ].trim().length < 1 ) {
              sessions.splice( i, 1 );
            }
          }
        } else if ( ( $( this ).html().replace( /&nbsp;*/gm, '' ).trim().length > 0 ) && ( $( this ).text().trim().length > 0 ) ) {
          // Otherwise, if there's a single session,
          // create an array with one item, the session
          sessions = [ $( this ).text().trim() ];
        }

        if ( sessions ) {
          for ( i = 0; i < sessions.length; i++ ) {
            var session = {},
                times = cleaner.times( dates[ column - 1 ], sessions[ i ] );
              
              session.activity = activityName;
              if ( activityType ) {
                session.type = activityType;
              }
              session.start = times.start;
              session.end = times.end;

              if ( age ) { 
                session.age = age;
              }
              
            venue.schedule.push( session );
          }
        }
      }
    } );
  }

  function processBody( err, resp, body ) {
    if ( err ) {
      callback( err );
    } else {
      var $ = cheerio.load( body ),
          geocoderURLEscaped;

      // Only gather information about a venue with drop-in swimming (as opposed to registration-only programmes)
      if ( $( '[id^="dropin_Swimming"]' ).length < 1 ) {
        // If there are no drop-in swimming programmes, fire the callback with an error
        console.log( 'No drop-in swimming programmes detected for url ' + url );

        callback( null );
      } else {
        // The regex removes newlines and tabs from the venue name.
        var venue = {
              name: cleaner.venue( $( '#pfrContentBody h1' ).text() ),
              originalUrl: resp.request.href,
              schedule: []
            },
            address = $( '.pfrComplexLocation ul li:nth-child(1)' ).text().trim(),
            addressRegex = /([0-9]*\s*?[0-9\/]*?)(?:\s*)([A-Za-z.\s]*(?=[A-Za-z][0-9][A-Za-z](?:\s)?[0-9][A-Za-z][0-9]))([A-Za-z][0-9][A-Za-z])(?:\s)?([0-9][A-Za-z][0-9])/,
            addressArray;

        // Deals with postal code typo on
        // http://www.toronto.ca/parks/prd/facilities/complex/1317/
        // Toronto Parks was emailed about the error on 6 Sept 2013
        if ( address === '145 Guildwood Pky MIE 1P5' ) {
          address = '145 Guildwood Pky M1E 1P5';
        }

        addressArray = address.match( addressRegex );

        // Create geocoderURL for getting venue's coordinates from geocoder.ca
        if ( addressArray ) {
          var streetNumber = addressArray[ 1 ].trim().replace(/\s{2,}/g, ' '),
              streetName = addressArray[ 2 ].trim().replace(/\s{2,}/g, ' '),
              postalCode = addressArray[ 3 ] + addressArray[ 4 ],
              geocoderURL = 'http://geocoder.ca/?' +
                'stno=' +
                streetNumber.replace( /\//g, '%2F' ) +
                '&addresst=' +
                streetName +
                '&city=Toronto&province=ON&postal=' +
                postalCode +
                '&geoit=XML';

          geocoderURLEscaped = geocoderURL.replace( /\s/g, '%20' );
        } else {
          if( !addressArray ) {
            console.log( 'getLatLong failed for the following address:\n' + address );
          }
        }

        // Get the venue's swimming schedule.
        // A week's schedule is contained in a div with an ID beginning with `dropin_Swimming`
        $( '[id^="dropin_Swimming"]' ).each( function( index ) {
          // The `thead` contains one blank `th` (above the column with the swim types)
          // and seven `th`s with the dates for that week.
          var dates = [],
              date;

          $( this ).find( 'th' ).each( function() {

            if ( $( this ).text().length > 0 ) {
              try {
                date = cleaner.date( $( this ).text() );
              } catch ( err ) {
                // If there's an error, print it and skip to the next
                // th in the loop
                console.log( err );

                return true;
              }

              dates.push( date );
            }
          } );

          if ( dates.length === 0 ) {
            callback( new Error( 'Could not determine dates for dropin_Swimming table ' + index ) );
          } else {
            // Each <tr> contains the week's schedule for a given activity
            $( this ).find( 'tbody' ).find( 'tr' ).each( function( index ) {
              processRow( $, $( this ), dates, venue );
            } );         
          }
        } );

        // Request the coordinates from geocoder.ca.
        // On success, create the rest of the venue's information
        request.get( geocoderURLEscaped, function( err, resp, body ) {
          if ( err ) {
            callback( err );
          } else {
            var $xml = cheerio.load( body, { xmlMode: true } ),
                longitude = parseFloat( $xml( 'longt' ).text() ),
                latitude = parseFloat( $xml( 'latt' ).text() ),
                phone,
                ward;

            venue.url = venue.name.replace( /[-]/g, ' ' ) // Turn hyphens into spaces
              .replace( /[^a-zA-Z0-9\s]/g, '' ) // Remove non alphanum except whitespace
              .replace( /^\s+|\s+$/, '' ) // Remove leading and trailing whitespace
              .replace( /\s+/g, '-' ) // Replace (multiple) whitespaces with a hyphen
              .toLowerCase();
            if ( $( '#pfrComplexTabs-facilities td:contains("Indoor Pool")' ).length > 0 ) {
              if ( $( '#pfrComplexTabs-facilities td:contains("Outdoor Pool")' ).length > 0 ) {
                venue.type = 'indoor and outdoor';
              } else {
                venue.type = 'indoor';
              }
            } else {
              venue.type = 'outdoor';
            }
            // The second regex replaces double spaces in the description with single spaces.
            venue.description = $( '#pfrComplexDescr p' ).text()
              .replace( /(\r\n|\n|\r|\t)/gm, '' )
              .trim()
              .replace( /(\s\s)/gm, ' ' );
            venue.address = address;
            
            venue.location = {
              type: 'Point',
              index: '2dsphere'
            };

            // Joseph J. Piccininni and Giovanni Caboto have the same address.
            // This gives them different (& accurate) lat & long so they don't perfectly overlap
            if ( venue.name === 'Joseph J. Piccininni Community Centre' ) {
              venue.location.coordinates = [ -79.451007, 43.675246 ];
            } else if ( venue.name === 'Giovanni Caboto' ) {
              venue.location.coordinates = [ -79.451858, 43.675638 ];
            } else {
              venue.location.coordinates = [ longitude, latitude ];
            }
            // The regex adds hyphens to phone numbers.
            phone = parseInt( $( '.pfrComplexLocation ul li:contains("Contact Us:")' ).text().replace( /[^0-9]/gm, '' ), 10 );
            if ( phone ) {
              // Add hyphens to phone number
              venue.phone = phone.toString().match( /\d{3}(?=\d{2,3})|\d+/g ).join( '-' );
            } else {
              venue.phone = '416-338-4386'; // Defaults to recreation department's customer service line
            }
            venue.accessibility = $( '.pfrComplexLocation ul li:contains(" Accessible")' ).text().trim();
            venue.district = $( '.pfrComplexLocation ul li:contains("District:")' ).text().trim().replace( /District: /gm, '' );
            venue.intersection = $( '.pfrComplexLocation ul li:contains("Near:")' ).text().trim().replace( /Near: /gm, '' );
            venue.transit = $( '.pfrComplexLocation ul li:contains("TTC Information:")' ).text().trim().replace( /TTC Information: /gm, '' ).replace( /\s\s/gm, ' ' );
            ward = parseInt( $( '.pfrComplexLocation ul li:contains("Ward:")' ).text().replace( /Ward: /gm, '' ), 10 );
            
            if ( ward ) { venue.ward = ward; }

            callback( null, venue );
          }
        } );
      }
    }
  }

  request( url, processBody );
};