var exports,
    mongoose = require( 'mongoose' ),
    Venue = new mongoose.Schema( {
      name: String,
      url: String,
      originalUrl: String,
      type: { type: String },
      description: String,
      address: String,
      location: {
        type: { type: String },
        coordinates: [ Number ], // coordinates must be stored as [ longitude, latitude ], per Google Maps API
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

exports = module.exports = Venue;