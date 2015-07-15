var _ = require('lodash'),
    Snapshot = require('../../models/snapshot'),
    moment = require('moment-timezone').tz.setDefault('America/Los_Angeles'),
    urls = require('../../cronjobs/urls');

module.exports = function(req, res, next) {
  var appListType = req.params.type;
  var sortedList;

  if (!urls[appListType])
    return res.json({status: 400, error: 'list type does not exist.'});

  Snapshot.find({listType: appListType, recorded_date: moment.tz().format('MM-DD-YYYY')}, function(err, snapshot) {
    if (err)
      return res.json({status: 400, error: err});

    if (!snapshot.length) {
      return res.json({status: 400, error: 'no snapshot found for this type.'});
    }

    var sortedList = _.sortBy(_.first(snapshot).apps, function(app) {
       return app.current_ranking;
    });

    res.json({status: 200, snapshot: sortedList});
  });
};