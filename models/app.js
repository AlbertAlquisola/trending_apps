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
  },

  last_seven: {
    type: Array,
    required: true
  },

  last_thirty: {
    type: Array,
    required: true
  },

  last_ninety: {
    type: Array,
    required: true
  },

  current_ranking: {
    type: Number,
    required: true
  },

  previous_ranking: {
    type: Number,
    required: true
  },

  change_in_ranking: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model('App', App);