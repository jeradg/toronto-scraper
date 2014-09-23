module.exports = function ( rawName ) {
  // Remove extra whitespace
  var name = rawName.replace( /(\r\n|\n|\r|\t)/g, '' )
    .replace( /([ \t\r\n]{2,})/g, ' ' )
    // 'And' shoudn't be capitalized.
    .replace( / And /g, ' and ' )
    .trim();

  switch ( name ) {
    case 'North Toronto Memorial Community':
      name = 'North Toronto Memorial Community Centre';
      break;
    case 'Centennial Recreation Centre-Scarborough':
      name = 'Centennial Recreation Centre - Scarborough';
      break;
    case 'West Mall Outdoor Pool - Outdoor Pool':
      name = 'West Mall Outdoor Pool';
      break;
  }

  return name;
};