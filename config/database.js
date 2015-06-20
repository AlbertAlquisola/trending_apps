module.exports = (function() {
// Setting local NODE_ENV to production in heroku environment
switch (process.env.NODE_ENV || 'development') {
  case 'production':
  return {
      // Setting MONGO_URI to the MongoLab Database
      // http://mongolab.com
      mongo_uri: process.env.MONGO_URI
    };
    case 'development':
    return {
      // Use local MongoDB database
      mongo_uri: 'mongodb://localhost/loop-api'
    };
  }
})();