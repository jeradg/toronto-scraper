var exports,
    mongoose = require( 'mongoose' ),
    Metadata = new mongoose.Schema( {
                 activities: [ {
                   activity: String,
                   types: [ String ]
                 } ],
                 ages: [ String ]
               }, { collection: 'metadata' } );

var exports = module.exports = Metadata;
