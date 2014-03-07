var exports = module.exports = Day;

// Constructor for day objects
function Day( dateObject ) {
  this.year = dateObject.getFullYear();
  this.month = dateObject.getMonth(); // Between 0-11
  this.date = dateObject.getDate(); // Between 1-31
  this.activities = [];
}
