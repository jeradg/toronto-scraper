// Module dependencies
var application_root = __dirname,
    express = require( 'express' ),
    path = require( 'path' ),
    mongoose = require( 'mongoose' );

var app = express();

app.configure( function() {
  // Parses request body and populates request.body
  app.use( express.bodyParser() );

  // Checks request.body for HTTP method overrides
  app.use( express.methodOverride() );

  // Performs route look-up based on URL and HTTP method
  app.use( app.router );

  // Where to serve static content
  app.use( express.static( path.join( application_root, 'site' ) ) );

  // Shows all errors in development
  app.use( express.errorHandler( { dumpExceptions: true, showStack: true } ) );
} );

// Start the server
var port = 4796;
app.listen( port, function() {
  console.log( 'Express server listening on port %d in %s mode.', port, app.settings.env );
} );

// Routes
app.get( '/api', function( request, response ) {
  response.send( 'swimTO API is running.' );
} );

app.get( '/api/venues', function( request, response ) {
  return VenueModel.find( function( error, venues ) {
    if ( !error ) {
      return response.send( venues );
    } else {
      return console.log( error );
    }
  } );
} );

// Connect to the database
mongoose.connect( 'mongodb://localhost/toapi' );
