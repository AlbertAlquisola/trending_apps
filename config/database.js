module.exports = (function() {
console.log("NODE_ENV: " + process.env.NODE_ENV)
// Setting local NODE_ENV to production in heroku environment
switch (process.env.NODE_ENV || 'development') {
  case 'production':
console.log("IN PRODUCTION DATABSE")
  return {
      // Setting MONGO_URI to the MongoLab Database
      // http://mongolab.comi
      
      mongo_uri: process.env.MONGO_URI
    };
    case 'development':
console.log("IN DEVELOPMENT DATABASE")
    return {
      // Use local MongoDB database
      mongo_uri: 'mongodb://localhost/trending_api'
    };
  }
})();
