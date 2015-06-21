var App = require('../../models/app');

module.exports = function(req, res, next) {
  App.find({}, function(err, apps){
    if (err) {
      res.json({
        status: 400,
        error: err
      });

    } else {
      console.log('showing top 100 apps');
      res.json({
        status: 200,
        apps: apps
      });
    }
  });
}