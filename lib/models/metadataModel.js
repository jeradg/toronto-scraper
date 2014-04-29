var mongoose = require( 'mongoose' ),
    Metadata = require( '../schemas/metadata' ),
    exports = module.exports = MetadataModel = mongoose.model( 'Metadata', Metadata );