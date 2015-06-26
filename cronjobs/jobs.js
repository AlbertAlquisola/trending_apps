var _        = require('lodash'),
    async    = require('async'),
    request  = require('request'),
    Snapshot = require('../models/snapshot'),
    App      = require('../models/app'),
    CronJob  = require('cron').CronJob,
    urls     = require('./urls');

function makeRequests(value, key) {
  new CronJob('20 07 22 * * 0-6', fetchAppData, null, true, 'America/Los_Angeles');

  function makeRequest(callback) {
    var options = {};

    request(value, function(err, data) { 
      if (err) {
        console.log(err);
        return callback(new Error('There was an error fetching data from the API.'));
      }

      options.data = JSON.parse(data.body);
      callback(null, options);
    });
  }

  function addSnapshotToDb(options, callback) {
    var snapshot = new Snapshot({created_at: new Date(), ranking: options.data.feed.entry});

    snapshot.save(function(err, snapshot) {
      if (err) {
        console.log(err);
        return callback(new Error('There was an error saving the snapshot to the db.'));
      }

      callback(null, options);
    });
  }

  function addNewAppsToDb(options, callback) {
    _.each(options.data.feed.entry, function(appData) {
      var appId = appData.id.attributes['im:id'];

      App.find({app_id: appId}, function(err, app) {
        if (err) {
          console.log(err);
          return callback(new Error('There was an error fetching the matching app.'));
        }

        if (!app.length) {
          var newApp = new App({created_at: new Date(), app_id: appId, metadata: appData});
          newApp.save();
        }
      });
    });

    callback(null, options);
  }

  function doneCallback(err, results) {
    if (err) {
      console.log(err);
    
    } else {
      console.log(results);
    }
  }

  function fetchAppData() {
    async.waterfall([
      makeRequest,
      addSnapshotToDb,
      addNewAppsToDb

    ], doneCallback);
  }
}

_.forIn(urls, makeRequests);