var exports,
    mongoose = require( 'mongoose' ),
    Venue = new mongoose.Schema( {
      name: String,
      url: String,
      originalUrl: String,
      description: String,
      address: String,
      location: {
        type: { 
          type: String
        },
        coordinates: [ Number ], // coordinates must be stored as [ longitude, latitude ]
        index: String
      },
      phone: String,
      accessibility: String,
      ward: Number,
      district: String,
      intersection: String,
      transit: String,
      schedule: [ { // The schedule is an array of weeks
        year: Number, // This is the year associated with the week number. The last week of the year can contain days that are part of the previous calendar year; likewise, the first week of the year does not always in include the first days of that calendar year.
        weekNumber: Number,
        days: [ {
          year: Number,
          month: Number,
          date: Number,
          fullDate: Date,
          activities: [ {
            activity: String,
            type: { type: String },
            age: String,
            sessions: [ { // sessions are sub-models
              startTime: String, // A time in the 24-hour clock, e.g. '09:00'
              endTime: String // A time in the 24-hour clock
            } ]
          } ]
        } ]
      } ]
    } );

exports = module.exports = Venue;