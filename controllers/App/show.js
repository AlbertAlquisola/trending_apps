var App = require('../../models/app');

module.exports = function(req, res, next) {
  App.findById(req.params.id, function(err, app) {
    if (err)
      return res.json({status: 400, error: err});
    
      console.log('successfully retrieved app info for: ' + app.title);
      res.json({status: 200, app: app});
  });
}