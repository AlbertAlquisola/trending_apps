var _        = require('lodash'),
    async    = require('async'),
    request  = require('request'),
    Snapshot = require('../models/snapshot'),
    CronJob  = require('cron').CronJob,
    urls     = require('./urls');
// var cronJobTimes = '00 00 12 * * 1-7';

function makeRequests(value, key) {
  // set to fire every second for testing purposes
  // make sure to convert this to once-per-day
  new CronJob('* * * * * *', fetchAppData, null, true, 'America/Los_Angeles');

  function makeRequest(callback) {
    request(value, function(err, data, body) { 
      // console.log(data);

      if (err) {
        console.log(err);
        return callback(err);

      } else {
        callback(null, data, body);
      }
    });
  }

  function formatSnapshot(data, body, callback) {
    // pass through for now until actually formatting JSON
    callback(null, data, body);
  }

  function addSnapshotToDb(data, body, callback) {
    // pass through for now until actually inserting into DB
    var snapshot = new Snapshot({date: '06202015', ranking: [1]});
    console.log(snapshot.date);
    snapshot.save(function(err, snapshot) {
      console.log(snapshot);
    });
    callback(null, 'done');
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
      formatSnapshot,
      addSnapshotToDb

    ], doneCallback);
  }
}

_.forIn(urls, makeRequests);