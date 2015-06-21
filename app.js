var express       = require('express'),      // Express Framework
    mongoose      = require('mongoose'),     // MongoDB Mapping
    bodyParser    = require('body-parser'),  // Request body parser
    errorhandler  = require('errorhandler'), // Stack trace printing on error
    config        = require('./config'),     // Config options
    cronJob       = require('./cronjobs'),   // start cronjob to fetch data daily
    app           = express();               // Creating the express app

// Creating MongoDB connection via Mongoose
mongoose.connect(config.database.mongo_uri);

// Conditional module loading if in development environment
if ('development' == app.get('env')) {
  app.use(errorhandler());
};

// Setting bodyParser as express' parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// Setting application port number
app.set("port", config.server.port);

// TODO: remove and only allow development server and hosted server routes
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Require HTTP route endpoints
var routes = require('./routes')(app);

// Set the application to listen on a specified port
app.listen(app.get("port"), function() {
  var status = "trending apps API is listening on port " + app.get("port") +
               " in " + app.settings.env + " mode"
  console.log(status);
});

