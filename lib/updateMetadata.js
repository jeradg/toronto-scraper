var exports = module.exports = updateMetadata,
    mongoose = require( 'mongoose' ),
    database = require( './database' ),
    VenueModel = require( './models/venueModel' ),
    MetadataModel = require( './models/metadataModel' );

function updateMetadata() {
  console.log( '\nUpdating metadata...\n' );

// mongoose.connect( database );

// mongoose.connection.on( 'error', function( error ) { return console.log( error ) } );

// mongoose.connection.on( 'open', function() {
    MetadataModel.remove( function( error ) {
      if ( !error ) {
        aggregateActivities( finish );
      } else {
        return console.log( 'ERROR: Couldn\'t remove the venues collection. There was the following error: \n' + error );
      }
    } );
// } );
}

function aggregateActivities( callback ) {
  VenueModel.aggregate( [ {
    $project: {
      _id: 0,
      activities: '$schedule.days.activities'
      // types: '$schedule.days.activities.type'
    }
  }, {
    $unwind: '$activities'
  }, {
  //   $unwind: '$types'
  // }, {
    $unwind: '$activities'
  // }, {
  //   $unwind: '$types'
  }, {
    $unwind: '$activities'
  }, {
    $project: {
      _id: 0,
      activity: '$activities.activity',
      type: '$activities.type'
    }
  }, {
    $group: {
      _id: '$activity',
      types: {
        $addToSet: '$type'
      }
    }
  }, {
    $sort: {
      _id: 1
    }
  } ], function( error, response ) {
    var activities = [],
        i = 0;

    for ( i; i < response.length; i++ ) {
      activities.push( {
        activity: response[ i ]._id,
        types: response[ i ].types
      } );
    }

    console.log( 'Activities:\n' );
    console.log( activities );
    console.log( '\n' );

    return aggregateAges( activities, callback );
  } );
}

function aggregateAges( activities, callback ) {
  VenueModel.aggregate( [ {
    $project: {
      _id: 0,
      ages: '$schedule.days.activities.age'
    }
  }, {
    $unwind: '$ages'
  }, {
    $unwind: '$ages'
  }, {
    $unwind: '$ages'
  }, {
    $group: {
      _id: '$ages'
    }
  }, {
    $sort: {
      _id: 1
    }
  } ], function( error, response ) {
    var ages = [],
        i = 0;

    for ( i; i < response.length; i++ ) {
      ages.push( response[ i ]._id );
    }

    console.log( 'Ages:\n' );
    console.log( ages );
    console.log( '\n' );

    return aggregateTypes( activities, ages, callback );
  } );
}

function aggregateTypes( activities, ages, callback ) {
  VenueModel.aggregate( [ {
    $project: {
      _id: 0,
      types: '$type'
    }
  }, {
    $group: {
      _id: '$types'
    }
  }, {
    $sort: {
      _id: 1
    }
  } ], function( error, response ) {
    var types = [],
        i = 0;

    for ( i; i < response.length; i++ ) {
      types.push( response[ i ]._id );
    }

    console.log( 'Types:\n' );
    console.log( types );
    console.log( '\n' );

    return createMetadata( activities, ages, types, callback );
  } );
}

function createMetadata( activities, ages, types, callback ) {
  MetadataModel.create( { activities: activities, ages: ages, types: types }, function( error, metadata ) {
    if ( !error ) {
      callback();
    } else {
      return console.log( error );
    }
  } );
}

function finish() {
  mongoose.connection.close();
  console.log( '------------------------------\n' +
               'Metadata updated.\n' );
}
