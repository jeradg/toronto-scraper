var exports = module.exports = server,
    args = process.argv.slice( 2 ),
    port = args[ 0 ] || process.env.PORT || 5000;

function server( port, callback ) {
  // Module dependencies
  var port              = port || 5000,
      express           = require( 'express' ),
      slash             = require( 'express-slash' ),
      path              = require( 'path' ),
      // mongoose          = require( 'mongoose' ),
      app               = express(),
      static_directory  = path.resolve( __dirname, 'test_pages/' ),
      node_env          = 'development',
      dbURI             = 'mongodb://localhost/test';

  // mongoose.set( 'debug', true );

  // Turn on strict routing
  app.enable( 'strict routing' );

  app.configure( function() {
    // Parses request body and populates req.body
    app.use( express.bodyParser() );

    // Checks req.body for HTTP method overrides
    app.use( express.methodOverride() );

    // Performs route look-up based on URL and HTTP method
    app.use( app.router );

    // Handles trailing slashes on URLs
    app.use( slash() );

    // Where to serve static content
    app.use( express.static( static_directory ) );

    // Shows all errors in development
    app.use( express.errorHandler( { dumpExceptions: true, showStack: true } ) );
  } );

 // // Connect to the database
 //  mongoose.connect( dbURI, function( err, res ) {
 //    if ( err ) { 
 //      console.log ( 'ERROR connecting to database. ' + err );
 //    } else {
 //      console.log ( 'Connected to database. Press CTRL-C to exit.' );

 //     // Start the server
      app.listen( port, function() {
        console.log( 'Express server running on port ' + port + '.' );
        callback();
      } );
  //   }
  // } );
}