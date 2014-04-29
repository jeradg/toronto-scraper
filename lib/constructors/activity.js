var exports = module.exports = Activity;

// Constructor for activity objects. Takes one argument, an `options` object.
// The options object has a mandatory activity property, and optional type
// and age properties.
function Activity( options ) {
  this.activity = options.activity;
  this.type = options.type;
  this.age = options.age;
  this.sessions = [];
}
