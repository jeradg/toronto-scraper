var exports = module.exports = requestURL,
    request = require( 'request' ),
    cheerio = require( 'cheerio' ),
    helpers = require( './helpers' ),
    createVenue = require( './createVenue' ),
    updateVenue = require( './updateVenue' ),
    Activity = require( './activity' ),
    Week = require( './week' );

function requestURL( url, callback ) {
  var venues,
      today = new Date(),
      thisYear = today.getFullYear(),
      lastYear = thisYear - 1,
      nextYear = thisYear + 1;

  request( url, function( error, resp, body ) {
    if ( !error ) {
      var $ = cheerio.load( body ),
          thisVenue = {},
          id = undefined,
          thisWeekIndex = 0;

      // Only gather information about venues with drop-in swimming (as opposed to registration-only programmes)
      if ( $( '[id^="dropin_Swimming"]' ).length > 0 ) {
        // The regex removes newlines and tabs from the venue name.
        thisVenue.name = $( '#content h1' ).text().replace( /(\r\n|\n|\r|\t)/gm, '' ).replace( /([ \t\r\n][ \t\r\n]*)/, ' ' ).trim();
        thisVenue.url = resp.request.href;
        thisVenue.schedule = [];

        // A week's schedule is contained in a div with an ID beginning with `dropin_Swimming`
        $( '[id^="dropin_Swimming"]' ).each( function() {
          // The `thead` contains one blank `th` (above the column with the swim types)
          // and seven `th`s with the dates for that week.
          var dates = [],
              thisWeek,
              weekNumberArray,
              $thisRow,
              thisDate,
              age,
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

              for ( var i = 0; i < helpers.daysOfTheWeek.length; i++ ) {
                if ( dayOfTheWeekString === helpers.daysOfTheWeek[ i ] ) {
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
          
          weekNumberArray = helpers.getWeekNumber( dates[ 0 ] );
          thisWeek = new Week( weekNumberArray[ 0 ], weekNumberArray[ 1 ], weekNumberArray[ 2 ] );
          thisVenue.schedule.push( thisWeek );

          // Each <tr> contains the week's schedule for a given activity
          $( this ).find( 'tbody' ).find( 'tr' ).each( function( row ) {

            var $thisRow = $( this ),
                activity = $thisRow
                  .find( '.coursetitlecol' )
                  .text()
                  .trim()
                  .replace( /([ \t]\-[ \t])/gm, ': ' )
                  .replace( /([ \t]:[ \t])/gm, ': ' )
                  .replace( /(Leisure:)/gm, 'Leisure Swim:' )
                  .replace( /(MARCH BREAK: )|(March Break )|(: March Break)|(INTERIM: )|(DROP\-IN: )/gm, '' ),
                age = $thisRow.find( '.courseagecol' ).length > 0 
                  ? $( this )
                    .find( '.courseagecol' )
                    .text()
                    .replace( /(\(|\))/gm, '' )
                    .replace( /([0-9])(yrs)/gm, '$1 years' )
                  : undefined,
                type = undefined;

            // Clean up the activity names
            if ( activity.indexOf( 'Humber College' ) !== -1 ) {
              activity = 'Lane Swim: Humber College staff and students';
            } else if ( activity.indexOf( 'Preschool Swim' ) !== -1 ) {
              activity = 'Leisure Swim: Preschool';
            } else if ( activity.indexOf( 'Adapted Leisure Swim' ) !== -1 ) {
              activity = 'Leisure Swim: Adapted';
            } else {
              switch ( activity ) {
                case 'Older Adult Aquafit':
                  activity = 'Aquafit: Older Adult';
                  break;
                case 'Leisure swim':
                  activity = 'Leisure Swim';
                  break;
                case 'Leisure: Preschool':
                  activity = 'Leisure Swim: Preschool';
                  break;
                case 'Family Swim':
                  activity = 'Leisure Swim: Family';
                  break;
                case 'Family Day Leisure Swim':
                  activity = 'Leisure Swim';
                  break;
                case 'Lane Swim: Older Adult (2 lanes)'
                  || 'Lane Swim : Older Adult':
                  activity = 'Lane Swim: Older Adult';
                  break;
                case activity.indexOf( 'Humber College' ) !== -1:
                  activity = 'Lane Swim: Humber College staff and students';
                  break;
                case 'Lane Swim: Adult':
                  activity = 'Lane Swim';
                  age = age || '13 years and over';
                  break;
                case 'Leisure Swim: Adult':
                  activity = 'Leisure Swim';
                  age = age || '13 years and over';
                  break;
                case 'Leisure Swim: Female Only'
                  || 'Leisure: Female Only':
                  activity = 'Leisure Swim: Female';
                  break;
                case 'Senior Swim':
                  activity = 'Leisure Swim: Older Adult';
                  break;
                case 'Width Swim':
                  activity = 'Lane Swim: Widths';
                  break;
              }
            }

            // Break the activities into main activities and sub activities. If there is a colon
            // in the activity, everything before the colon is the activity, and everything after the colon is the type
            if ( activity.indexOf( ':' ) !== -1 ) {
              var activitySplit = activity.split( ': ' );

              activity = activitySplit[ 0 ];
              type = activitySplit[ 1 ];
            }

            $( this ).find( 'td' ).each( function( column ) {

              if ( $( this ).find( '.coursetitlecol' ).length > 0 ) {
                return true; // Skips to next object in .each() loop

              // Next we check for a <br> tag, which can signify that there are 
              // multiple sessions for the activity that day.
              } else {
                if ( ( $( this ).find( 'br' ) ) && ( $( this ).html().trim().split( /<br>|<br \/>/ ).length > 1 ) ) {
                  // If the result of splitting on <br>s is more than one array item, 
                  // each array item is a session.
                  var theseActivities = thisVenue.schedule[ thisWeekIndex ].days[ column - 1 ].activities;
                  sessionsSplit = $( this ).html().trim().split( /<br>|<br \/>/ );

                  theseActivities.push( new Activity( { activity: activity, type: type, age: age } ) );

                  for ( var i = 0; i < sessionsSplit.length; i++ ) {
                    var newSession = helpers.processTimes( dates[ column - 1 ], sessionsSplit[ i ], thisVenue.schedule[ thisWeekIndex ] );
                    theseActivities[ theseActivities.length - 1 ].sessions.push( newSession );
                  }
                } else if ( ( $( this ).html().replace( /&nbsp;*/gm, '' ).trim().length > 0 ) && ( $( this ).text().trim().length > 0 ) ) {
                  var newSession = helpers.processTimes( dates[ column - 1 ], $( this ).text().trim(), thisVenue.schedule[ thisWeekIndex ] ),
                      theseActivities = thisVenue.schedule[ thisWeekIndex ].days[ column - 1 ].activities;

                  theseActivities.push( new Activity( { activity: activity, type: type, age: age } ) );
                  theseActivities[ theseActivities.length - 1 ].sessions.push( newSession );
                }
              }
            } );
          } );         

          thisWeekIndex++;
        } );

        VenueModel.findOne( { 'name': thisVenue.name }, function( error, foundVenue ) {
          if ( !error ) {
            if ( foundVenue ) {
              // If the venue already exists in the database, update its schedule
              updateVenue( thisVenue, foundVenue, callback );
            } else {
              // Otherwise, create it
              createVenue( thisVenue, $, callback );
            }
          } else {
            return console.log( error );
          }
        } );

      } else {
        // If there are no drop-in swimming programmes, fire the request callback
        callback();
      }
    
    } else {
      console.log( 'ERROR: While trying to request the URL ' + url + ', there was the following error: \n' + error );
      callback();
    }
  } );
}
