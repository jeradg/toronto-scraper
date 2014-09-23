var mongoose = require( 'mongoose' ),
    MetadataSchema = new mongoose.Schema( {
      activities: [ {
        activity: String,
        types: [ String ]
      } ],
      ages: [ String ],
      types: [ String ]
    }, { collection: 'metadata' } );

module.exports = mongoose.model( 'Metadata', MetadataSchema );