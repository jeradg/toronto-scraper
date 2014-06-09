var chai = require( 'chai' ),
    expect = chai.expect,
    request = require( 'request' ),
    path = require( 'path' ),
    fs = require( 'fs' ),
    cheerio = require( 'cheerio' ),
    server = require( './testServer' ),
    port = 7345,
    // tempPath = path.resolve( __dirname, 'temp/' ),
    getURLs = require( '../lib/getURLs' );

describe( 'scraper', function() {
  before( function( done ) {
    server( port, done );
  } );

  describe( 'getURLs', function() {
    it( 'should return an error when passed a first argument that isn\'t an array', function( done ) {
      var urls = { 'foo': 'bar' },
          callback = function( err, venueURLs ) {
            expect( err ).to.be.an.instanceOf( Error );

            done();
          }

      getURLs( urls, callback );
    } );

    it( 'should return an error when passed an empty array', function( done ) {
      var urls = [],
          callback = function( err, venueURLs ) {
            expect( err ).to.be.an.instanceOf( Error );

            done();
          }

      getURLs( urls, callback );
    } );

    it( 'should return an error when passed a website with no valid links', function( done ) {
      var urls = [
            'http://localhost:' + port + '/noPoolsHere.html'
          ],
          callback = function( err, venueURLs ) {
            expect( err ).to.be.an.instanceOf( Error );

            done();
          }

      getURLs( urls, callback );
    } );

    it( 'gets the URLs from a page with a list of venue pages', function( done ) {
      var urls = [
            'http://localhost:' + port + '/outdoorPools.html',
            'http://localhost:' + port + '/indoorPools.html'
          ],
          callback = function( err, venueURLs ) {
            expect( err ).to.equal( null );

            expect( venueURLs ).to.be.an( 'array' );
            expect( venueURLs.length ).to.equal( 20 );

            done();
          }

      getURLs( urls, callback );
    } );
  } );
} );