var _        = require('lodash'),
    async    = require('async'),
    request  = require('request'),
    moment   = require('moment'),
    CronJob  = require('cron').CronJob,
    Snapshot = require('../models/snapshot'),
    App      = require('../models/app'),
    urls     = require('./urls');

function scheduleJob(value, key) {
  var attemptCount = 0,
      fetched;

  // schedule daily cronjob to run at 8am PST
  new CronJob('00 00 08 * * 0-6', fetchAppData, null, true, 'America/Los_Angeles');

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
    var snapshot = new Snapshot({
      created_at: new Date(),
      recorded_date: moment().format('MM-DD-YYYY'),
      ranking: options.data.feed.entry
    });

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
    // if error, recursively try and fetch data.
    if (err && attemptCount < 10 && !fetched) {
      console.log(err);
      attemptCount++;
      fetchAppData();

    } else if (attemptCount >= 10) {
      console.log('excess request attempts made. Stop scheduler from running.');

    } else {
      fetched = true;
      console.log('successfully pulled in app data at: ', new Date());
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

// for every url, schedule a daily cronjob
_.forIn(urls, scheduleJob);