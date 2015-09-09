var controller = require('../controllers'),
    snapshots = controller.snapshots,
    apps = controller.apps;

module.exports = function(app) {
  app.get('/',
    snapshots.all
  );

  app.get('/snapshots/:type',
    snapshots.show
  );

  app.get('/apps',
    apps.all
  );

  app.get('/apps/:id',
    apps.show
  );
}