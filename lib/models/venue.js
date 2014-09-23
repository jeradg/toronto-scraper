var mongoose = require( 'mongoose' ),
    VenueSchema = new mongoose.Schema( {
      name: String,
      url: String,
      originalUrl: String,
      type: { type: String },
      description: String,
      address: String,
      location: {
        type: { type: String },
        // coordinates must be stored as
        // [ longitude, latitude ], per Google Maps API
        coordinates: [ Number ],
        index: String
      },
      phone: String,
      accessibility: String,
      ward: Number,
      district: String,
      intersection: String,
      transit: String,
      schedule: [ {
        activity: String,
        type: { type: String },
        age: String,
        start: Date,
        end: Date
      } ]
    } );
    
module.exports = mongoose.model( 'Venue', VenueSchema );