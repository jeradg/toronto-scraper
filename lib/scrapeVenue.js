var exports = module.exports = scrapeVenue,
    request = require( 'request' ),
    cheerio = require( 'cheerio' ),
    cleanActivity = require( './helpers/cleanActivity' ),
    dateHelpers = require( './helpers/dateHelpers' ),
    cleanActivity = require( './helpers/cleanActivity' ),
    cleanVenueName = require( './helpers/cleanVenueName' ),
    cleanDate = require( './helpers/cleanDate' ),
    createVenue = require( './createVenue' ),
    updateVenue = require( './updateVenue' );

function scrapeVenue( url, callback ) {
  function processBody( err, resp, body ) {
    if ( err ) {
      callback( err );
    } else {
      var $ = cheerio.load( body ),
          weekNum = 0;

      // Only gather information about a venue with drop-in swimming (as opposed to registration-only programmes)
      if ( $( '[id^="dropin_Swimming"]' ).length < 1 ) {
        // If there are no drop-in swimming programmes, fire the request callback
        callback( null );
      } else {
        // The regex removes newlines and tabs from the venue name.
        var venue = {
          name: cleanVenueName( $( '#content-body h1' ).text() ),
          url: resp.request.href,
          schedule: []
        }

        // A week's schedule is contained in a div with an ID beginning with `dropin_Swimming`
        $( '[id^="dropin_Swimming"]' ).each( function() {
          // The `thead` contains one blank `th` (above the column with the swim types)
          // and seven `th`s with the dates for that week.
          var dates = [];

          $( this ).find( 'th' ).each( function() {

            if ( $( this ).text().length > 0 ) {
              var date = cleanDate( $( this ).text() );

              dates.push( date );
            }
          } );

          // Each <tr> contains the week's schedule for a given activity
          $( this ).find( 'tbody' ).find( 'tr' ).each( function( row ) {

            var $row = $( this ),
                rawAge = $row.find( '.courseagecol' ).length > 0 
                  ? $row.find( '.courseagecol' ).text()
                  : undefined,
                activity = cleanActivity( $row.find( '.coursetitlecol' ).text(), rawAge ),
                activityName = activity[ 0 ],
                activityType = activity[ 1 ],
                age = activity[ 2 ];

            $row.find( 'td' ).each( function( column ) {

              if ( $( this ).find( '.coursetitlecol' ).length > 0 ) {
                return true; // Skips to next object in .each() loop

              // Next we check for a <br> tag, which can signify that there are 
              // multiple sessions for the activity that day.
              } else {
                if ( ( $( this ).find( 'br' ) ) && ( $( this ).html().trim().split( /<br>|<br \/>/ ).length > 1 ) ) {
                  // If the result of splitting on <br>s is more than one array item, 
                  // each array item is a session.
                  var sessionsSplit = $( this ).html().trim().split( /<br>|<br \/>/ );

                  theseActivities.push( new Activity( { activity: activityName, type: activityType, age: age } ) );

                  for ( var i = 0; i < sessionsSplit.length; i++ ) {
                    var newSession = dateHelpers.processTimes( dates[ column - 1 ], sessionsSplit[ i ], venue.schedule[ weekNum ] );
                    theseActivities[ theseActivities.length - 1 ].sessions.push( newSession );
                  }
                } else if ( ( $( this ).html().replace( /&nbsp;*/gm, '' ).trim().length > 0 ) && ( $( this ).text().trim().length > 0 ) ) {
                  var newSession = dateHelpers.processTimes( dates[ column - 1 ], $( this ).text().trim(), venue.schedule[ weekNum ] ),
                      theseActivities = venue.schedule[ weekNum ].days[ column - 1 ].activities;

                  theseActivities.push( new Activity( { activity: activityName, type: activityType, age: age } ) );
                  theseActivities[ theseActivities.length - 1 ].sessions.push( newSession );
                }
              }
            } );
          } );         

          weekNum++;
        } );

        VenueModel.findOne( { 'name': venue.name }, function( err, foundVenue ) {
          if ( err ) {
            callback( err );
          } else {
            if ( foundVenue ) {
              // If the venue already exists in the database, update its schedule
              updateVenue( venue, foundVenue, callback );
            } else {
              // Otherwise, create it
              createVenue( venue, $, callback );
            }
          }
        } );
      }
    }
  }

  request( url, processBody );
}
