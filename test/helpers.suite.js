var chai = require( 'chai' ),
    expect = chai.expect,
    moment = require( 'moment-timezone' ),
    cleaner = require( '../lib/helpers/cleaner' );

describe( 'cleaner', function() {
  describe( 'date', function() {
    it( 'should return a cleaned date as a string of format "YYYY-MM-DD"', function() {
      var dateObject1 = new Date( 'June 9' ),
          now = new Date(),
          day,
          testDate1;

      dateObject1.setYear( now.getFullYear() );
      day = cleaner.days[ dateObject1.getDay() ];
      testDate1 = cleaner.date( day + ' Jun 09' );

      expect( testDate1 ).to.be.a( 'string' );

      expect( testDate1 ).to.equal( dateObject1.getFullYear() + '-06-09' );

      var dateObject2 = new Date( 'August 23' ),
          now = new Date(),
          day,
          testDate2;

      dateObject2.setYear( now.getFullYear() - 1 );

      day = cleaner.days[ dateObject2.getDay() ];

      testDate2 = cleaner.date( day + ' Aug 23' );

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

  describe( 'times', function() {
    it( 'should convert session times into the correct timezone and account for daylight savings', function() {
      var date1 = moment().startOf( 'day' ),
          times1 = cleaner.times( date1.format( 'YYYY-MM-DD' ), '11:30am - 2pm' );

      expect( times1.start ).to.be.an.instanceOf( Date );
      expect( times1.start ).to.eql( new Date( date1.hours( 11 ).minutes( 30 ).format() ) );
      expect( times1.end ).to.be.an.instanceOf( Date );
      expect( times1.end ).to.eql( new Date( date1.hours( 14 ).minutes( 00 ).format() ) );
      expect( times1.start ).to.be.below( times1.end );

      var date2 = moment().startOf( 'day' ),
          times2 = cleaner.times( date2.format( 'YYYY-MM-DD' ), '9:45 - 10:45am' );

      expect( times2.start ).to.be.an.instanceOf( Date );
      expect( times2.start ).to.eql( new Date( date2.hours( 9 ).minutes( 45 ).format() ) );
      expect( times2.end ).to.be.an.instanceOf( Date );
      expect( times2.end ).to.eql( new Date( date2.hours( 10 ).minutes( 45 ).format() ) );
      expect( times2.start ).to.be.below( times2.end );

      var date3 = moment().startOf( 'day' ),
          times3 = cleaner.times( date3.format( 'YYYY-MM-DD' ), '2 - 5:30pm' );

      expect( times3.start ).to.be.an.instanceOf( Date );
      expect( times3.start ).to.eql( new Date( date3.hours( 14 ).minutes( 00 ).format() ) );
      expect( times3.end ).to.be.an.instanceOf( Date );
      expect( times3.end ).to.eql( new Date( date3.hours( 17 ).minutes( 30 ).format() ) );
      expect( times3.start ).to.be.below( times3.end );
    } );
  } );

  describe( 'activity', function() {
    it( 'should return a cleaned activity', function() {
      var testActivity1 = cleaner.activity( 'Lane Swim', 'up to 25 yrs' );

      expect( testActivity1 ).to.be.an( 'array' );
      expect( testActivity1.length ).to.equal( 3 );
      expect( testActivity1[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity1[ 1 ] ).to.equal( undefined );
      expect( testActivity1[ 2 ] ).to.equal( 'up to 25 years' );

      var testActivity2 = cleaner.activity( 'Leisure Swim: Female' );

      expect( testActivity2 ).to.be.an( 'array' );
      expect( testActivity2.length ).to.equal( 3 );
      expect( testActivity2[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity2[ 1 ] ).to.equal( 'Female' );
      expect( testActivity2[ 2 ] ).to.equal( undefined );

      var testActivity3 = cleaner.activity( 'Leisure Swim: Preschool', '1yr and over' );

      expect( testActivity3 ).to.be.an( 'array' );
      expect( testActivity3.length ).to.equal( 3 );
      expect( testActivity3[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity3[ 1 ] ).to.equal( 'Preschool' );
      expect( testActivity3[ 2 ] ).to.equal( '1 year and over' );

      var testActivity4 = cleaner.activity( 'Youth lifeguard club' );

      expect( testActivity4 ).to.be.an( 'array' );
      expect( testActivity4.length ).to.equal( 3 );
      expect( testActivity4[ 0 ] ).to.equal( 'Youth Lifeguard Club' );
      expect( testActivity4[ 1 ] ).to.equal( undefined );
      expect( testActivity4[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Humber College" swims', function() {
      var testActivity = cleaner.activity( 'Humber College swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Humber College Staff and Students' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Preschool Swim"', function() {
      var testActivity = cleaner.activity( 'Preschool Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Preschool' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Adapted Leisure Swim"', function() {
      var testActivity = cleaner.activity( 'Adapted Leisure Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Adapted' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Aquafit: Athritis"', function() {
      var testActivity = cleaner.activity( 'Aquafit: Athritis' );

      expect( testActivity[ 0 ] ).to.equal( 'Aquafit' );
      expect( testActivity[ 1 ] ).to.equal( 'Arthritis' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Aquafit: Deep Water"', function() {
      var testActivity = cleaner.activity( 'Aquafit: Deep Water' );

      expect( testActivity[ 0 ] ).to.equal( 'Aquafit' );
      expect( testActivity[ 1 ] ).to.equal( 'Deep' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Aquafit: Shallow Water"', function() {
      var testActivity = cleaner.activity( 'Aquafit: Shallow Water' );

      expect( testActivity[ 0 ] ).to.equal( 'Aquafit' );
      expect( testActivity[ 1 ] ).to.equal( 'Shallow' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Older Adult Swim"', function() {
      var testActivity = cleaner.activity( 'Older Adult Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Older Adult' );
      expect( testActivity[ 2 ] ).to.equal( '60 years and over' );
    } );

      it( 'should correctly fix "EXCLUSIVE USE Camp Swim"', function() {
      var testActivity = cleaner.activity( 'EXCLUSIVE USE Camp Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'City Camps' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Leisure Swim: All Camps"', function() {
      var testActivity = cleaner.activity( 'Leisure Swim: All Camps' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'City Camps' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "School is Out Leisure Swim"', function() {
      var testActivity = cleaner.activity( 'School is Out Leisure Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( undefined );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Older Adult Aquafit"', function() {
      var testActivity = cleaner.activity( 'Older Adult Aquafit' );

      expect( testActivity[ 0 ] ).to.equal( 'Aquafit' );
      expect( testActivity[ 1 ] ).to.equal( 'Older Adult' );
      expect( testActivity[ 2 ] ).to.equal( '60 years and over' );
    } );

    it( 'should correctly fix "Leisure Swim: INDOOR POOL"', function() {
      var testActivity = cleaner.activity( 'Leisure Swim: INDOOR POOL' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( undefined );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Leisure swim"', function() {
      var testActivity = cleaner.activity( 'Leisure swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( undefined );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Leisure Swim: Early Opening"', function() {
      var testActivity = cleaner.activity( 'Leisure Swim: Early Opening' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( undefined );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Leisure: Preschool"', function() {
      var testActivity = cleaner.activity( 'Leisure: Preschool' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Preschool' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Family Swim"', function() {
      var testActivity = cleaner.activity( 'Family Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Family' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "PA Day Leisure Swim"', function() {
      var testActivity = cleaner.activity( 'PA Day Leisure Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Family' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Family Day Leisure Swim"', function() {
      var testActivity = cleaner.activity( 'Family Day Leisure Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( undefined );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Lane Swim: Older Adult (2 lanes)"', function() {
      var testActivity = cleaner.activity( 'Lane Swim: Older Adult (2 lanes)' );

      expect( testActivity[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Older Adult' );
      expect( testActivity[ 2 ] ).to.equal( '60 years and over' );
    } );

    it( 'should correctly fix "Lane Swim : Older Adult"', function() {
      var testActivity = cleaner.activity( 'Lane Swim : Older Adult' );

      expect( testActivity[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Older Adult' );
      expect( testActivity[ 2 ] ).to.equal( '60 years and over' );
    } );

    it( 'should correctly fix "Lane Swim: Adult"', function() {
      var testActivity = cleaner.activity( 'Lane Swim: Adult' );

      expect( testActivity[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Adult' );
      expect( testActivity[ 2 ] ).to.equal( '13 years and over' );
    } );

    it( 'should correctly fix "Lane Swim: LANE"', function() {
      var testActivity = cleaner.activity( 'Lane Swim: LANE' );

      expect( testActivity[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity[ 1 ] ).to.equal( undefined );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Lane Swim: Lane"', function() {
      var testActivity = cleaner.activity( 'Lane Swim: Lane' );

      expect( testActivity[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity[ 1 ] ).to.equal( undefined );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Lane Swim: Female Only Swim"', function() {
      var testActivity = cleaner.activity( 'Lane Swim: Female Only Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Female' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Leisure Swim: Adult"', function() {
      var testActivity = cleaner.activity( 'Leisure Swim: Adult' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Adult' );
      expect( testActivity[ 2 ] ).to.equal( '13 years and over' );
    } );

      it( 'should correctly fix "Leisure Swim: Female Only"', function() {
      var testActivity = cleaner.activity( 'Leisure Swim: Female Only' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Female' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Leisure: Female Only"', function() {
      var testActivity = cleaner.activity( 'Leisure: Female Only' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Female' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Senior Swim"', function() {
      var testActivity = cleaner.activity( 'Senior Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Older Adult' );
      expect( testActivity[ 2 ] ).to.equal( '60 years and over' );
    } );

    it( 'should correctly fix "Lane Swim: Width"', function() {
      var testActivity = cleaner.activity( 'Lane Swim: Width' );

      expect( testActivity[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Widths' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Width Swim"', function() {
      var testActivity = cleaner.activity( 'Width Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'Widths' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix "Camps Swim"', function() {
      var testActivity = cleaner.activity( 'Camps Swim' );

      expect( testActivity[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity[ 1 ] ).to.equal( 'City Camps' );
      expect( testActivity[ 2 ] ).to.equal( undefined );
    } );

    it( 'should correctly fix cases where the activity name and type are transposed', function() {
      var testActivity1 = cleaner.activity( 'Adult: Lane Swim' );

      expect( testActivity1[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity1[ 1 ] ).to.equal( 'Adult' );
      expect( testActivity1[ 2 ] ).to.equal( '13 years and over' );

      var testActivity2 = cleaner.activity( 'All Ages: Leisure Swim' );

      expect( testActivity2[ 0 ] ).to.equal( 'Leisure Swim' );
      expect( testActivity2[ 1 ] ).to.equal( 'All Ages' );
      expect( testActivity2[ 2 ] ).to.equal( undefined );

      var testActivity3 = cleaner.activity( 'Widths: Lane swim' );

      expect( testActivity3[ 0 ] ).to.equal( 'Lane Swim' );
      expect( testActivity3[ 1 ] ).to.equal( 'Widths' );
      expect( testActivity3[ 2 ] ).to.equal( undefined );
    } );
  } );

  describe( 'venue', function() {
    it( 'should return a cleaned venue name', function() {
      var venue1 = 'Mr. Magoo\'s Magical Swimming Venue',
          testVenueName1 = cleaner.venue( venue1 );

      expect( testVenueName1 ).to.be.a( 'string' );
      expect( testVenueName1 ).to.equal( venue1 )

      var venue2 = ' Hello Dolly    Community Centre And    Pool  ',
          testVenueName2 = cleaner.venue( venue2 );

      expect( testVenueName2 ).to.be.a( 'string' );
      expect( testVenueName2 ).to.equal( 'Hello Dolly Community Centre and Pool' )
    } );

    it( 'should correctly fix "North Toronto Memorial Community"', function() {
      var testName = cleaner.venue( 'North Toronto Memorial Community' );

      expect( testName ).to.equal( 'North Toronto Memorial Community Centre' );
    } );

    it( 'should correctly fix "Centennial Recreation Centre-Scarborough"', function() {
      var testName = cleaner.venue( 'Centennial Recreation Centre-Scarborough' );

      expect( testName ).to.equal( 'Centennial Recreation Centre - Scarborough' );
    } );

    it( 'should correctly fix "West Mall Outdoor Pool - Outdoor Pool"', function() {
      var testName = cleaner.venue( 'West Mall Outdoor Pool - Outdoor Pool' );

      expect( testName ).to.equal( 'West Mall Outdoor Pool' );
    } );
  } );
} );