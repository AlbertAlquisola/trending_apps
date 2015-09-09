var _        = require('lodash'),
    async    = require('async'),
    request  = require('request'),
    moment   = require('moment-timezone').tz.setDefault('America/Los_Angeles'),
    CronJob  = require('cron').CronJob,
    Snapshot = require('../models/snapshot'),
    App      = require('../models/app'),
    urls     = require('./urls');

function scheduleJob(value, key) {
  var attemptCount = 0,
      fetched;

  // schedule daily cronjob to run at 8am PST
  new CronJob('10 59 19 * * 0-6', fetchAppData, null, true, 'America/Los_Angeles');

  function makeRequest(callback) {
    var options = {};

    request(value, function(err, data) {
      if (err) {
        console.log(err);
        return callback(new Error('There was an error fetching data from the API.'));
      }

      options.apps = [];
      options.data = JSON.parse(data.body);
      callback(null, options);
    });
  }

  function addNewAppsToDb(options, callback) {
    var counter = 0;

    _.each(options.data.feed.entry, function(appData, index) {
      var appId = appData.id.attributes['im:id'],
          rank = index + 1,
          newApp;

      App.findOne({app_id: appId}, function(err, app) {
        if (err) {
          console.log(err);
          return callback(new Error('There was an error fetching the matching app.'));
        }

        if (!app) {
          newApp = new App({
            created_at: moment.tz(),
            app_id: appId,
            metadata: appData,
            last_seven: [rank],
            last_thirty: [rank],
            last_ninety: [rank],
            current_ranking: rank,
            previous_ranking: 0,
            change_in_ranking: {
              posOrNegChange: 1,
              rankingChange: 151 - rank
            },
          });

          newApp.save();
          options.apps.push(newApp);

        } else {
          // app already in DB so just update running rankings
          updateAppRanking(app, rank);
          options.apps.push(app);
        }

        counter++;
        if (counter >= 150) {
          callback(null, options);
        }
      });
    });
  }

  function addSnapshotToDb(options, callback) {
    var snapshot = new Snapshot({
      listType: key,
      created_at: moment.tz(),
      recorded_date: moment.tz().format('MM-DD-YYYY'),
      ranking: options.data.feed.entry,
      apps: options.apps
    });

    snapshot.save(function(err, snapshot) {
      if (err) {
        console.log(err);
        return callback(new Error('There was an error saving the snapshot to the db.'));
      }

      callback(null, options);
    });
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
      console.log('successfully pulled in app data on date: ', moment.tz().format('MM-DD-YYYY'));
    }
  }

  function fetchAppData() {
    async.waterfall([
      makeRequest,
      addNewAppsToDb,
      addSnapshotToDb

    ], doneCallback);
  }
}

/* 
 * helper functions
 */
function updateAppRanking(app, rank) {
  var currentRankingPointer = app.current_ranking;

  if (!app.current_ranking || !_.isNumber(app.currentRanking) || app.currentRanking > 150)
    currentRankingPointer = 151;

  app.last_seven = updateLastSeven(app, rank);
  app.last_thirty = updateLastThirty(app, rank);
  app.last_ninety = updateLastNinety(app, rank);

  app.current_ranking = rank;
  app.previous_ranking = currentRankingPointer;
  app.change_in_ranking = calculateRankingChange(rank, currentRankingPointer);
  
  app.save();
}

function calculateRankingChange(newRank, oldRank) {
  var rankInfo = {};

  // app fell out of top 150 and came back in
  if (!oldRank || !_.isNumber(oldRank) || oldRank > 150) {
    rankInfo.posOrNegChange = 1;
    rankInfo.rankingChange = 151 - newRank;

  // fell in rankings
  } else if (newRank > oldRank) {
    rankInfo.posOrNegChange = -1;
    rankInfo.rankingChange = Math.abs(newRank - oldRank);

  // moved up in rankings
  } else if (newRank < oldRank) {
    rankInfo.posOrNegChange = 1;
    rankInfo.rankingChange = Math.abs(newRank - oldRank);

  // ranking didnt change
  } else if (newRank === oldRank) {
    rankInfo.posOrNegChange = 0;
    rankInfo.rankingChange = 0;
  }

  return rankInfo; 
}

function updateLastSeven(app, rank) {
  var lastSeven = _.cloneDeep(app.last_seven);

  lastSeven.unshift(rank);
  lastSeven = lastSeven.slice(0,7);
  return lastSeven;
}

function updateLastThirty(app, rank) {
  var lastThirty = _.cloneDeep(app.last_thirty);

  lastThirty.unshift(rank);
  lastThirty = lastThirty.slice(0,30);
  return lastThirty;
}

function updateLastNinety(app, rank) {
  var lastNinety = _.cloneDeep(app.last_ninety);

  lastNinety.unshift(rank);
  lastNinety = lastNinety.slice(0,90);
  return lastNinety;
}

// for every url, schedule a daily cronjob
_.forIn(urls, scheduleJob);
