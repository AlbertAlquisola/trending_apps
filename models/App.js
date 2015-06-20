var mongoose = require('mongoose'),
    Schema   = mongoose.Schema

var App = new Schema({
  title: {
    type:     String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  details: {
    type:     String
  },
  ranking: {
    type: Number,
    required: true
  },
  createdAt: {
    type:     Date,
    required: true
  },
  updatedAt: {
    type:     Date,
    required: true
  }
});

module.exports = mongoose.model('App', App);