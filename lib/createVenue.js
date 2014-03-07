var exports = module.exports = createVenue,
    request = require( 'request' ),
    cheerio = require( 'cheerio' ),
    helpers = require( './helpers' );

function createVenue( someVenue, $, callback ) {
  var address = $( '.pfrComplexLocation ul li:nth-child(1)' ).text().trim(),
      addressRegex = /([0-9]*\s*?[0-9\/]*?)(?:\s*)([A-Za-z.\s]*(?=[A-Za-z][0-9][A-Za-z](?:\s)?[0-9][A-Za-z][0-9]))([A-Za-z][0-9][A-Za-z])(?:\s)?([0-9][A-Za-z][0-9])/,
      addressArray;

  // Deals with error on http://www.toronto.ca/parks/prd/facilities/complex/1317/
  // Toronto Parks was emailed about the error on 6 Sept 2013
  if ( address === '145 Guildwood Pky MIE 1P5' ) {
    address = '145 Guildwood Pky M1E 1P5';
  }

  addressArray = address.match( addressRegex );

  if ( addressArray ) {
    var streetNumber = addressArray[ 1 ].trim().replace(/\s{2,}/g, ' '),
        streetName = addressArray[ 2 ].trim().replace(/\s{2,}/g, ' '),
        postalCode = addressArray[ 3 ] + addressArray[ 4 ],
        geocoderURL = 'http://geocoder.ca/?' + 'stno=' + streetNumber.replace( /\//g, '%2F' ) + '&addresst=' + streetName + '&city=Toronto&province=ON&postal=' + postalCode + '&geoit=XML',
        geocoderURLEscaped = geocoderURL.replace( /\s/g, '%20' );
  } else {
    if( !addressArray ) {
      console.log( 'getLatLong failed for the following address:\n' + address );
    }
  }

  request.get( geocoderURLEscaped, function( error, response, body ) {
    var $xml = cheerio.load( response.body, { xmlMode: true } ),
        longitude = parseFloat( $xml( 'longt' ).text() ),
        latitude = parseFloat( $xml( 'latt' ).text() );

    someVenue.normalizedUrl = someVenue.name.replace( /[-]/g, ' ' ) // Turn hyphens into spaces
      .replace( /[^a-zA-Z0-9\s]/g, '' ) // Remove non alphanum except whitespace
      .replace( /^\s+|\s+$/, '' ) // Remove leading and trailing whitespace
      .replace( /\s+/g, '-' ) // Replace (multiple) whitespaces with a hyphen
      .toLowerCase();
    // The second regex replaces double spaces in the description with single spaces.
    someVenue.description = $( '#pfrComplexDescr p' ).text().replace( /(\r\n|\n|\r|\t)/gm, '' ).trim().replace( /(\s\s)/gm, ' ' );
    someVenue.address = address;
    someVenue.coordinates = [ longitude, latitude ];
    // The regex adds hyphens to phone numbers.
    someVenue.phone = parseInt( $( '.pfrComplexLocation ul li:contains("Contact Us:")' ).text().replace( /[^0-9]/gm, '' ), 10 );
    someVenue.accessibility = $( '.pfrComplexLocation ul li:contains(" Accessible")' ).text().trim();
    someVenue.ward = parseInt( $( '.pfrComplexLocation ul li:contains("Ward:")' ).text().replace( /Ward: /gm, '' ), 10 );
    someVenue.district = $( '.pfrComplexLocation ul li:contains("District:")' ).text().trim().replace( /District: /gm, '' );
    someVenue.intersection = $( '.pfrComplexLocation ul li:contains("Near:")' ).text().trim().replace( /Near: /gm, '' );
    someVenue.transit = $( '.pfrComplexLocation ul li:contains("TTC Information:")' ).text().trim().replace( /TTC Information: /gm, '' ).replace( /\s\s/gm, ' ' );

    VenueModel.create(
      {
        name: someVenue.name,
        url: someVenue.normalizedUrl,
        originalUrl: someVenue.url,
        description: someVenue.description,
        address: someVenue.address,
        location: {
          type: 'Point',
          coordinates: someVenue.coordinates,
          index: '2dsphere'
        },
        phone: someVenue.phone || 4163384386, // Defaults to recreation department's customer service line
        accessibility: someVenue.accessibility,
        ward: someVenue.ward || 0, // Defaults to 0
        district: someVenue.district,
        intersection: someVenue.intersection,
        transit: someVenue.transit,
        schedule: someVenue.schedule
      }, function( error, venue ) {
        if ( !error ) {
          console.log( 'Created ' + venue.name );
          callback();
        } else {
          return console.log( error );
        }
      }
    );

  } );
}
