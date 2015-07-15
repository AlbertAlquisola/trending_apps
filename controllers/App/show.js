var App = require('../../models/app');

module.exports = function(req, res, next) {
  App.find({app_id: req.params.id}, function(err, app) {
    if (err)
      return res.json({status: 400, error: err});
    
    if (!app.length) {
      return res.json({status: 200, message: 'no app found wth this ID'});
    }
      console.log('successfully retrieved app info for: ' + app[0].metadata['im:name'].label);
      return res.json({status: 200, app: app[0]});
  });
}