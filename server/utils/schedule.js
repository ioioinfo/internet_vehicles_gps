var schedule = require('node-schedule');
var uu_request = require('./uu_request');

var url = "http://127.0.0.1:18037/get_location_no_update";
uu_request.get(url, function(err, response, body) {
    if (!err && response.statusCode === 200) {
        
    } else {
        console.log("网络错误");
    }
});

var j = schedule.scheduleJob('27 * * * *', function(){

});
