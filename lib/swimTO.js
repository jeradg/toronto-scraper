/* swimTO.js */

var exports = module.exports = createApplication,
    update = require( './update' );

function createApplication() {
  var app = function() {};

  app.update = update;

  return app;
}
