var App = require('../../models/app');

module.exports = function(req, res, next) {
  App.findById(req.params.id, function(err, app){
    if (err) {
      res.json({
        status: 400,
        error: err
      });
    
    } else {
      console.log('successfully retrieved app info for: ' + app.title);
      res.json({
        status: 200,
        apps: app
      });
    }
  });
}