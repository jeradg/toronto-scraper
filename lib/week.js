var exports = module.exports = Week,
    Day = require( './day' );

// Constructor for week objects
function Week( someYear, weekNumber, sunday ) {
  var newDate,
      i;

  this.year = someYear;
  this.weekNumber = weekNumber;
  // The days array contains 7 arrays, for the 7 days of the week. Sunday is days[ 0 ].
  this.days = [];

  // Add Day objects to the days array for each day in the week.
  for ( i = 0; i < 7; i++ ) {
    // Set newDate to the week's Sunday
    newDate = new Date( sunday );
    // Then, set newDate to be Sunday's date plus this day of the week's number 
    // (e.g., 0 for Sunday, 1 for Monday, etc.)
    newDate.setDate( sunday.getDate() + i );
    // Add the new Day object to the array
    this.days.push( new Day( newDate ) );
  }
}
