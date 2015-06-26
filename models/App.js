var mongoose = require('mongoose'),
    Schema   = mongoose.Schema

var App = new Schema({
  created_at: {
    type: Date,
    required: true
  },

  app_id: {
    type: String,
    required: true
  },

  metadata: {
    type: Object,
    required: true
  }
});

module.exports = mongoose.model('App', App);