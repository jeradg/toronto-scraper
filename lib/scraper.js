var exports = module.exports,
    venueController = require( './controllers/venue' ),
    metadataController = require( './controllers/metadata' );

exports.run = function( indexURLs, callback ) {
  venueController.run( indexURLs, callback );
};

exports.updateMetadata = metadataController.run;