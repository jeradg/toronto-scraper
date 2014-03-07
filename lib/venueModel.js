var mongoose = require( 'mongoose' ),
    Venue = require( './venue' ),
    exports = module.exports = VenueModel = mongoose.model( 'Venue', Venue );