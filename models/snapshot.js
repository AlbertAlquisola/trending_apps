var mongoose = require('mongoose'),
    Schema   = mongoose.Schema

var Snapshot = new Schema({
  listType: {
    type: String,
    required: true
  },

  created_at: {
    type:     Date,
    required: true
  },

  recorded_date: {
    type: String,
    required: true
  },

  ranking: {
    type: Array,
    required: true
  },

  apps: {
    type: Array,
    required: true
  }
});

module.exports = mongoose.model('Snapshot', Snapshot);