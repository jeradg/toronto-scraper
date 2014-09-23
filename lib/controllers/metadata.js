var exports = module.exports,
    mongoose = require( 'mongoose' ),
    Venue = require( '../models/venue' ),
    Metadata = require( '../models/metadata' );

exports.run = function( callback ) {
  console.log( '\nUpdating metadata...\n' );

  Metadata.remove( function( err ) {
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
};

function aggregateActivities( metadata, callback ) {
  Venue.aggregate( [ {
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
  Venue.aggregate( [ {
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
  Venue.aggregate( [ {
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
  Metadata.create( metadata, function( err, resp ) {
    if ( err ) {
      callback( err );
    } else {
      callback( null );
    }
  } );
}