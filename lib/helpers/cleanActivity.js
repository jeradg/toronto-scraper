var exports = module.exports = cleanActivity;

function cleanActivity( rawActivity, rawAge ) {

  var activity = rawActivity.trim()
        .replace( /([ \t]\-[ \t])/gm, ': ' )
        .replace( /([ \t]:[ \t])/gm, ': ' )
        .replace( /(Leisure:)/gm, 'Leisure Swim:' )
        .replace( /(AquaFit:)/gm, 'Aquafit:' )
        .replace( /(MARCH BREAK: )|(March Break )|(: March Break)|(INTERIM: )|(INTERIM )|(DROP\-IN: )/gm, '' )
        .replace( /([^\W_]+[^\s-]*) */g, function( text ){ return text.charAt( 0 ).toUpperCase() + text.substr( 1 ).toLowerCase(); } ),
      type,
      age;

  // Clean up the activity names
  if ( activity.indexOf( 'Humber College' ) !== -1 ) {
    activity = 'Lane Swim: Humber College Staff and Students';
  } else if ( activity.indexOf( 'Preschool Swim' ) !== -1 ) {
    activity = 'Leisure Swim: Preschool';
  } else if ( activity.indexOf( 'Adapted Leisure Swim' ) !== -1 ) {
    activity = 'Leisure Swim: Adapted';
  } else {
    switch ( activity ) {
      case 'Aquafit: Athritis':
        activity = 'Aquafit: Arthritis';
        break;
      case 'Aquafit: Deep Water':
        activity = 'Aquafit: Deep';
        break;
      case 'Aquafit: Shallow Water':
        activity = 'Aquafit: Shallow';
        break;
      case 'Older Adult Swim':
        activity = 'Leisure Swim: Older Adult';
        break;
      case 'Exclusive Use Camp Swim':
        activity = 'Leisure Swim: City Camps';
        break;
      case 'Camps Swim':
        activity = 'Leisure Swim: City Camps';
        break;
      case 'Leisure Swim: All Camps':
        activity = 'Leisure Swim: City Camps';
        break;
      case 'School Is Out Leisure Swim':
        activity = 'Leisure Swim';
        break;
      case 'Older Adult Aquafit':
        activity = 'Aquafit: Older Adult';
        break;
      case 'Leisure Swim: Indoor Pool':
        activity = 'Leisure Swim';
        break;
      case 'Leisure Swim: Early Opening':
        activity = 'Leisure Swim';
        break;
      case 'Leisure: Preschool':
        activity = 'Leisure Swim: Preschool';
        break;
      case 'Family Swim':
        activity = 'Leisure Swim: Family';
        break;
      case 'Pa Day Leisure Swim':
        activity = 'Leisure Swim: Family';
        break;
      case 'Family Day Leisure Swim':
        activity = 'Leisure Swim';
        break;
      case 'Lane Swim: Older Adult (2 Lanes)':
        activity = 'Lane Swim: Older Adult';
        break;
      case 'Lane Swim : Older Adult':
        activity = 'Lane Swim: Older Adult';
        break;
      case 'Lane Swim: LANE':
        activity = 'Lane Swim';
        break;
      case 'Lane Swim: Lane':
        activity = 'Lane Swim';
        break;
      case 'Lane Swim: Female Only Swim':
        activity = 'Lane Swim: Female';
        break;
      case 'Leisure Swim: Female Only':
        activity = 'Leisure Swim: Female';
        break;
      case 'Leisure: Female Only':
        activity = 'Leisure Swim: Female';
        break;
      case 'Senior Swim':
        activity = 'Leisure Swim: Older Adult';
        break;
      case 'Lane Swim: Width':
        activity = 'Lane Swim: Widths';
        break;
      case 'Width Swim':
        activity = 'Lane Swim: Widths';
        break;
    }
  }

  // If there is a colon in the activity,
  // everything before the colon is the activity,
  // and everything after the colon is the type
  if ( activity.indexOf( ':' ) !== -1 ) {
    var activitySplit = activity.split( ': ' );

    activity = activitySplit[ 0 ];
    type = activitySplit[ 1 ];
  }

  if ( activity.match( /Widths|Adult|All Ages|Arthritis|Deep|Female|Older Adult|Shallow|Preschool|Youth/ ) ) {
    var realActivity = type,
        realType = activity;

    activity = realActivity;
    type = realType;
  }

  // Process the age
  if ( rawAge ) {
    age = rawAge.replace( /(\(|\))/gm, '' )
      .replace( /([0-9])[ \t]*yrs/gm, '$1 years' )
      .replace( /([0-9])[ \t]*yr/gm, '$1 year' );  
  }

  if ( !age && ( type === 'Older Adult' ) ) {
    age = '60 years and over';
  } else if ( !age && ( type === 'Adult' ) ) {
    age = '13 years and over';
  }

  return [ activity, type, age ];
}