var mongoose = require( 'mongoose' ),
    Metadata = require( './metadata' ),
    exports = module.exports = MetadataModel = mongoose.model( 'Metadata', Metadata );