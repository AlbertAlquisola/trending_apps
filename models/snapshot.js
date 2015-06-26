var mongoose = require('mongoose'),
    Schema   = mongoose.Schema

var Snapshot = new Schema({
  created_at: {
    type:     Date,
    required: true
  },
  ranking: {
    type: Array,
    required: true
  }
});

module.exports = mongoose.model('Snapshot', Snapshot);