var controller = require('../controllers'),
    snapshots = controller.snapshots,
    apps = controller.apps;


module.exports = function(app) {
  app.get('/',
    snapshots.show
  );

  app.get('/snapshots',
    snapshots.show
  );

  app.get('/snapshots/:date',
    snapshots.show
  );

  app.get('/apps',
    apps.all
  );

  app.get('/apps/:id',
    apps.show
  );
}