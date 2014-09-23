var gulp = require( 'gulp' ),
    jshint = require( 'gulp-jshint' ),
    stylish = require( 'jshint-stylish' );

gulp.task( 'lint', function() {
  return gulp.src( './lib/**/*.js' )
    .pipe( jshint() )
    .pipe( jshint.reporter( stylish ) )
    .pipe( jshint.reporter( 'fail' ) ); // The task will fail if there are any errors
} );

gulp.task( 'default', [ 'lint' ] );