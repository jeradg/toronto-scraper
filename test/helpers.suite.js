var chai = require( 'chai' ),
    expect = chai.expect,
    moment = require( 'moment-timezone' ),
    dateHelpers = require( '../lib/helpers/dateHelpers' ),
    cleanActivity = require( '../lib/helpers/cleanActivity' ),
    cleanVenueName = require( '../lib/helpers/cleanVenueName' );

describe( 'swimTO helpers', function() {
  describe( 'dateHelpers', function() {
    describe( 'cleanDate', function() {
      it( 'should return a cleaned date as a string of format "YYYY-MM-DD"', function() {
        var dateObject1 = new Date( 'June 9' ),
            now = new Date(),
            day,
            testDate1;

        dateObject1.setYear( now.getFullYear() );
        day = dateHelpers.daysOfTheWeek[ dateObject1.getDay() ];
        testDate1 = dateHelpers.cleanDate( day + ' Jun 09' );

        expect( testDate1 ).to.be.a( 'string' );

        expect( testDate1 ).to.equal( dateObject1.getFullYear() + '-06-09' );

        var dateObject2 = new Date( 'August 23' ),
            now = new Date(),
            day,
            testDate2;

        dateObject2.setYear( now.getFullYear() - 1 );

        day = dateHelpers.daysOfTheWeek[ dateObject2.getDay() ];

        testDate2 = dateHelpers.cleanDate( day + ' Aug 23' );

        expect( testDate2 ).to.be.a( 'string' );

        expect( testDate2 ).to.equal( dateObject2.getFullYear() + '-08-23' );
      } );

      it( 'should return an error when the correct year cannot be determined from the day of the week and the date', function() {
        // TODO
      } );

      it( 'should work properly when run from a different timezone', function() {
        // TODO
      } );
    } );

    describe( 'processTimes', function() {
      it( 'should convert session times into the correct timezone and account for daylight savings', function() {
        var date1 = moment().startOf( 'day' ),
            times1 = dateHelpers.processTimes( date1.format( 'YYYY-MM-DD' ), '11:30am - 2pm' );

        expect( times1.start ).to.be.an.instanceOf( Date );
        expect( times1.start ).to.eql( new Date( date1.hours( 11 ).minutes( 30 ).format() ) );
        expect( times1.end ).to.be.an.instanceOf( Date );
        expect( times1.end ).to.eql( new Date( date1.hours( 14 ).minutes( 00 ).format() ) );
        expect( times1.start ).to.be.below( times1.end );

        var date2 = moment().startOf( 'day' ),
            times2 = dateHelpers.processTimes( date2.format( 'YYYY-MM-DD' ), '9:45 - 10:45am' );

        expect( times2.start ).to.be.an.instanceOf( Date );
        expect( times2.start ).to.eql( new Date( date2.hours( 9 ).minutes( 45 ).format() ) );
        expect( times2.end ).to.be.an.instanceOf( Date );
        expect( times2.end ).to.eql( new Date( date2.hours( 10 ).minutes( 45 ).format() ) );
        expect( times2.start ).to.be.below( times2.end );

        var date3 = moment().startOf( 'day' ),
            times3 = dateHelpers.processTimes( date3.format( 'YYYY-MM-DD' ), '2 - 5:30pm' );

        expect( times3.start ).to.be.an.instanceOf( Date );
        expect( times3.start ).to.eql( new Date( date3.hours( 14 ).minutes( 00 ).format() ) );
        expect( times3.end ).to.be.an.instanceOf( Date );
        expect( times3.end ).to.eql( new Date( date3.hours( 17 ).minutes( 30 ).format() ) );
        expect( times3.start ).to.be.below( times3.end );
      } );
    } );
  } );

  describe( 'cleanActivity', function() {
    it( 'should return a cleaned activity', function() {
      var testActivity1 = cleanActivity( 'Lane Swim', 'up to 25 yrs' );

      expect( testActivity1 ).to.be.an( 'array' );
      expect( testActivity1.length ).to.equal( 3 );
      expect( testActivity1[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity1[ 1 ] ).to.equal( undefined );
      expect( testActivity1[ 2 ] ).to.equal( 'up to 25 years' );

      var testActivity2 = cleanActivity( 'Leisure Swim: Female' );

      expect( testActivity2 ).to.be.an( 'array' );
      expect( testActivity2.length ).to.equal( 3 );
      expect( testActivity2[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity2[ 1 ] ).to.equal( 'Female' );
      expect( testActivity2[ 2 ] ).to.equal( undefined );

      var testActivity3 = cleanActivity( 'Leisure Swim: Preschool', '1yr and over' );

      expect( testActivity3 ).to.be.an( 'array' );
      expect( testActivity3.length ).to.equal( 3 );
      expect( testActivity3[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity3[ 1 ] ).to.equal( 'Preschool' );
      expect( testActivity3[ 2 ] ).to.equal( '1 year and over' );
    } );

    it( 'should correctly fix "Humber College" swims', function() {
      var testActivity = cleanActivity( 'Humber College swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Humber College Staff and Students' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Preschool Swim"', function() {
      var testActivity = cleanActivity( 'Preschool Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Preschool' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Adapted Leisure Swim"', function() {
      var testActivity = cleanActivity( 'Adapted Leisure Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Adapted' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Aquafit: Athritis"', function() {
      var testActivity = cleanActivity( 'Aquafit: Athritis' );

      expect( testActivity[ 0 ] ).to.equal( 'Aquafit' );
      expect( testActivity[ 1 ] ).to.equal( 'Arthritis' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Aquafit: Deep Water"', function() {
      var testActivity = cleanActivity( 'Aquafit: Deep Water' );

      expect( testActivity[ 0 ] ).to.equal( 'Aquafit' );
      expect( testActivity[ 1 ] ).to.equal( 'Deep' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Aquafit: Shallow Water"', function() {
      var testActivity = cleanActivity( 'Aquafit: Shallow Water' );

      expect( testActivity[ 0 ] ).to.equal( 'Aquafit' );
      expect( testActivity[ 1 ] ).to.equal( 'Shallow' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Older Adult Swim"', function() {
      var testActivity = cleanActivity( 'Older Adult Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Older Adult' );
      expect( testActivity[ 2 ] ).to.equal( '60 years and over' );
    } );

      it( 'should correctly fix "EXCLUSIVE USE Camp Swim"', function() {
      var testActivity = cleanActivity( 'EXCLUSIVE USE Camp Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'City Camps' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Leisure Swim: All Camps"', function() {
      var testActivity = cleanActivity( 'Leisure Swim: All Camps' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'City Camps' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "School is Out Leisure Swim"', function() {
      var testActivity = cleanActivity( 'School is Out Leisure Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( undefined );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Older Adult Aquafit"', function() {
      var testActivity = cleanActivity( 'Older Adult Aquafit' );

      expect( testActivity[ 0 ] ).to.equal( 'Aquafit' );
      expect( testActivity[ 1 ] ).to.equal( 'Older Adult' );
      expect( testActivity[ 2 ] ).to.equal( '60 years and over' );
    } );

    it( 'should correctly fix "Leisure Swim: INDOOR POOL"', function() {
      var testActivity = cleanActivity( 'Leisure Swim: INDOOR POOL' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( undefined );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Leisure swim"', function() {
      var testActivity = cleanActivity( 'Leisure swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( undefined );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Leisure Swim: Early Opening"', function() {
      var testActivity = cleanActivity( 'Leisure Swim: Early Opening' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( undefined );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Leisure: Preschool"', function() {
      var testActivity = cleanActivity( 'Leisure: Preschool' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Preschool' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Family Swim"', function() {
      var testActivity = cleanActivity( 'Family Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Family' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "PA Day Leisure Swim"', function() {
      var testActivity = cleanActivity( 'PA Day Leisure Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Family' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Family Day Leisure Swim"', function() {
      var testActivity = cleanActivity( 'Family Day Leisure Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( undefined );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Lane Swim: Older Adult (2 lanes)"', function() {
      var testActivity = cleanActivity( 'Lane Swim: Older Adult (2 lanes)' );

      expect( testActivity[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Older Adult' );
      expect( testActivity[ 2 ] ).to.equal( '60 years and over' );
    } );

    it( 'should correctly fix "Lane Swim : Older Adult"', function() {
      var testActivity = cleanActivity( 'Lane Swim : Older Adult' );

      expect( testActivity[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Older Adult' );
      expect( testActivity[ 2 ] ).to.equal( '60 years and over' );
    } );

    it( 'should correctly fix "Lane Swim: Adult"', function() {
      var testActivity = cleanActivity( 'Lane Swim: Adult' );

      expect( testActivity[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Adult' );
      expect( testActivity[ 2 ] ).to.equal( '13 years and over' );
    } );

    it( 'should correctly fix "Lane Swim: LANE"', function() {
      var testActivity = cleanActivity( 'Lane Swim: LANE' );

      expect( testActivity[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity[ 1 ] ).to.equal( undefined );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Lane Swim: Lane"', function() {
      var testActivity = cleanActivity( 'Lane Swim: Lane' );

      expect( testActivity[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity[ 1 ] ).to.equal( undefined );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Lane Swim: Female Only Swim"', function() {
      var testActivity = cleanActivity( 'Lane Swim: Female Only Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Female' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Leisure Swim: Adult"', function() {
      var testActivity = cleanActivity( 'Leisure Swim: Adult' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Adult' );
      expect( testActivity[ 2 ] ).to.equal( '13 years and over' );
    } );

      it( 'should correctly fix "Leisure Swim: Female Only"', function() {
      var testActivity = cleanActivity( 'Leisure Swim: Female Only' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Female' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Leisure: Female Only"', function() {
      var testActivity = cleanActivity( 'Leisure: Female Only' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Female' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Senior Swim"', function() {
      var testActivity = cleanActivity( 'Senior Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Older Adult' );
      expect( testActivity[ 2 ] ).to.equal( '60 years and over' );
    } );

    it( 'should correctly fix "Lane Swim: Width"', function() {
      var testActivity = cleanActivity( 'Lane Swim: Width' );

      expect( testActivity[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Widths' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Width Swim"', function() {
      var testActivity = cleanActivity( 'Width Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Widths' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Camps Swim"', function() {
      var testActivity = cleanActivity( 'Camps Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'City Camps' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix cases where the activity name and type are transposed', function() {
      var testActivity1 = cleanActivity( 'Adult: Lane Swim' );

      expect( testActivity1[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity1[ 1 ] ).to.equal( 'Adult' );
      expect( testActivity1[ 2 ] ).to.equal( '13 years and over' );

      var testActivity2 = cleanActivity( 'All Ages: Leisure Swim' );

      expect( testActivity2[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity2[ 1 ] ).to.equal( 'All Ages' );
      expect( testActivity2[ 2 ] ).to.equal( undefined );

      var testActivity3 = cleanActivity( 'Widths: Lane swim' );

      expect( testActivity3[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity3[ 1 ] ).to.equal( 'Widths' );
      expect( testActivity3[ 2 ] ).to.equal( undefined );
    } );
  } );

  describe( 'cleanVenueName', function() {
    it( 'should return a cleaned venue name', function() {
      var venue1 = 'Mr. Magoo\'s Magical Swimming Venue',
          testVenueName1 = cleanVenueName( venue1 );

      expect( testVenueName1 ).to.be.a( 'string' );
      expect( testVenueName1 ).to.equal( venue1 )

      var venue2 = ' Hello Dolly    Community Centre And    Pool  ',
          testVenueName2 = cleanVenueName( venue2 );

      expect( testVenueName2 ).to.be.a( 'string' );
      expect( testVenueName2 ).to.equal( 'Hello Dolly Community Centre and Pool' )
    } );

    it( 'should correctly fix "North Toronto Memorial Community"', function() {
      var testName = cleanVenueName( 'North Toronto Memorial Community' );

      expect( testName ).to.equal( 'North Toronto Memorial Community Centre' );
    } );

    it( 'should correctly fix "Centennial Recreation Centre-Scarborough"', function() {
      var testName = cleanVenueName( 'Centennial Recreation Centre-Scarborough' );

      expect( testName ).to.equal( 'Centennial Recreation Centre - Scarborough' );
    } );

    it( 'should correctly fix "West Mall Outdoor Pool - Outdoor Pool"', function() {
      var testName = cleanVenueName( 'West Mall Outdoor Pool - Outdoor Pool' );

      expect( testName ).to.equal( 'West Mall Outdoor Pool' );
    } );
  } );
} );