var exports = module.exports = updateMetadata,
    mongoose = require( 'mongoose' ),
    database = require( './database' ),
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
    $project: {
      _id: 0,
      activities: '$schedule.activity'
      // types: '$schedule.days.activities.type'
    }
  }, {
    $sort: {
      _id: 1
    }
  } ], function( err, response ) {
    if ( err ) {
      callback( err );
    } else {
      metadata.activities = [];

      for ( var i = 0; i < response.length; i++ ) {
        metadata.activities.push( {
          activity: response[ i ]._id,
          types: response[ i ].types
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
    $sort: {
      _id: 1
    }
  } ], function( err, response ) {
    if ( err ) {
      callback( err );
    } else {
      metadata.ages = [];

      for ( var i = 0; i < response.length; i++ ) {
        metadata.ages.push( response[ i ]._id );
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
      types: '$schedule.type'
    }
  }, {
    $group: {
      _id: '$types'
    }
  }, {
    $sort: {
      _id: 1
    }
  } ], function( err, response ) {
    if ( err ) {
      callback( err );
    } else {
      metadata.types = [];

      for ( var i = 0; i < response.length; i++ ) {
        metadata.types.push( response[ i ]._id );
      }

      console.log( 'Types:\n' );
      console.log( metadata.types );
      console.log( '\n' );

      createMetadata( metadata, callback );
    }
  } );
}

function createMetadata( metadata, callback ) {
  MetadataModel.create( metadata, function( err, metadata ) {
    if ( err ) {
      callback( err );
    } else {
      callback( null );
    }
  } );
}