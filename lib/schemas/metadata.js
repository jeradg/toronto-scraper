var exports,
    mongoose = require( 'mongoose' ),
    Metadata = new mongoose.Schema( {
                 activities: [ {
                   activity: String,
                   types: [ String ]
                 } ],
                 ages: [ String ],
                 types: [ String ]
               }, { collection: 'metadata' } );

var exports = module.exports = Metadata;
