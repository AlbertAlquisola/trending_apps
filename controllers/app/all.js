var App = require('../../models/app');

module.exports = function(req, res, next) {
  App.find({}, function(err, apps){
    if (err)
      return res.json({status: 400, error: err});

    console.log('showing all apps');
    res.json({status: 200, apps: apps});
  });
}
