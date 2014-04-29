var mongoose = require( 'mongoose' ),
    Venue = require( '../schemas/venue' ),
    exports = module.exports = VenueModel = mongoose.model( 'Venue', Venue );