var CronJob = require('cron').CronJob;
var request = require('request');
var url = 'https://itunes.apple.com/us/rss/topfreeapplications/limit=25/json';
// var cronJobTimes = '00 00 12 * * 1-7';

var job = new CronJob('* * * * * *', function(){
  request(url, function(err, response, body) { console.log(body); });
}, null, true, "America/Los_Angeles");