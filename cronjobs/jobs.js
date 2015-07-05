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
    _.each(options.data.feed.entry, function(appData, index) {
      var appId = appData.id.attributes['im:id'],
          rank = index + 1,
          newApp;


      App.find({app_id: appId}, function(err, app) {
        if (err) {
          console.log(err);
          return callback(new Error('There was an error fetching the matching app.'));
        }

        if (!app.length) {
          newApp = new App({
            created_at: new Date(),
            app_id: appId,
            metadata: appData,
            last_seven: [rank],
            last_thirty: [rank],
            last_ninety: [rank]
          });
          newApp.save();

        } else {
          // app already in DB so just update running rankings
          updateAppRanking(app[0], rank)
        }
      });
    });

    // helper function
    function updateAppRanking(app, rank) {
      app.last_seven.unshift(rank);
      app.last_thirty.unshift(rank);
      app.last_ninety.unshift(rank);

      // TODO: [Albert]
      // fix this so it slices the array vs just popping off the last one
      if (app.last_seven.length > 7)
        app.last_seven.pop();

      if (app.last_thirty.length > 30)
        app.last_thirty.pop();

      if (app.last_ninety > 90)
        app.last_ninety.pop();
    }

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