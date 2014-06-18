var exports = module.exports = updateMetadata,
    mongoose = require( 'mongoose' ),
    VenueModel = require( './models/venueModel' ),
    MetadataModel = require( './models/metadataModel' );

function updateMetadata( callback ) {
  console.log( '\nUpdating metadata...\n' );

  MetadataModel.remove( function( err ) {
    if ( err ) {
      callback( err );
    } else {
      var metadata = {};

      aggregateActivities( metadata, function( err ) {
        if ( err ) {
          callback( err );
        } else {
          console.log( '------------------------------\n' +
                       'Metadata updated.\n' );
          callback( null );
        }
      } );
    }
  } );
}

function aggregateActivities( metadata, callback ) {
  VenueModel.aggregate( [ {
    $unwind: '$schedule'
  }, {
    $group: {
      _id: '$schedule.activity',
      types: { $addToSet: '$schedule.type' }
    }
  }, {
    $sort: {
      _id: 1
    }
  } ], function( err, resp ) {
    if ( err ) {
      callback( err );
    } else {
      metadata.activities = [];

      for ( var i = 0; i < resp.length; i++ ) {
        metadata.activities.push( {
          activity: resp[ i ]._id,
          types: resp[ i ].types
        } );
      }

      console.log( 'Activities:\n' );
      console.log( metadata.activities );
      console.log( '\n' );

      aggregateAges( metadata, callback );
    }
  } );
}

function aggregateAges( metadata, callback ) {
  VenueModel.aggregate( [ {
    $project: {
      _id: 0,
      ages: '$schedule.age'
    }
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
  } ], function( err, resp ) {
    if ( err ) {
      callback( err );
    } else {
      metadata.ages = [];

      for ( var i = 0; i < resp.length; i++ ) {
        metadata.ages.push( resp[ i ]._id );
      }

      console.log( 'Ages:\n' );
      console.log( metadata.ages );
      console.log( '\n' );

      aggregateTypes( metadata, callback );
    }
  } );
}

function aggregateTypes( metadata, callback ) {
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
  } ], function( err, resp ) {
    if ( err ) {
      callback( err );
    } else {
      metadata.types = [];

      for ( var i = 0; i < resp.length; i++ ) {
        metadata.types.push( resp[ i ]._id );
      }

      console.log( 'Types:\n' );
      console.log( metadata.types );
      console.log( '\n' );

      createMetadata( metadata, callback );
    }
  } );
}

function createMetadata( metadata, callback ) {
  MetadataModel.create( metadata, function( err, resp ) {
    if ( err ) {
      callback( err );
    } else {
      callback( null );
    }
  } );
}