var _ = require('lodash'),
    moment = require('moment-timezone').tz.setDefault('America/Los_Angeles'),
    Snapshot = require('../../models/snapshot');

module.exports = function(req, res, next) {
  var date = req.params.date ? moment.tz(new Date(req.params.date)) : moment.tz();

  if (!date.isValid())
    return res.json({status: 400, error: 'invalid date requested.'});

  Snapshot.find({recorded_date: date.format('MM-DD-YYYY')}, function(err, snapshot) {
    if (err)
      return res.json({status: 400, error: err});

    if (!snapshot.length) {
      return res.json({status: 200, error: 'no snapshot for this date.'})
    }

    res.json({status: 200, snapshot: _.first(snapshot)});
  });
};