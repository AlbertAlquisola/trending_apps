var controller = require('../controllers'),
    apps = controller.apps 

module.exports = function(app) {
  app.get('/', apps.all)
}