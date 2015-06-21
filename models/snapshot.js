var mongoose = require('mongoose'),
    Schema   = mongoose.Schema

var Snapshot = new Schema({
  date: {
    type:     String,
    required: true
  },
  ranking: {
    type: Array,
    required: true
  },
  createdAt: {
    type:     Date
  },
  updatedAt: {
    type:     Date
  }
});

module.exports = mongoose.model('Snapshot', Snapshot);