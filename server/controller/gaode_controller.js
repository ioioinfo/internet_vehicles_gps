// Base routes for item..
const uu_request = require('../utils/uu_request');
const uuidV1 = require('uuid/v1');
var eventproxy = require('eventproxy');
var service_info = "vehicles GPS service";


var do_get_method = function(url,cb){
	uu_request.get(url, function(err, response, body){
		if (!err && response.statusCode === 200) {
			var content = JSON.parse(body);
			do_result(false, content, cb);
		} else {
			cb(true, null);
		}
	});
};
//所有post调用接口方法
var do_post_method = function(url,data,cb){
	uu_request.request(url, data, function(err, response, body) {
		if (!err && response.statusCode === 200) {
			do_result(false, body, cb);
		} else {
			cb(true,null);
		}
	});
};
//处理结果
var do_result = function(err,result,cb){
	if (!err) {
		if (result.success) {
			cb(false,result);
		}else {
			cb(true,result);
		}
	}else {
		cb(true,null);
	}
};


exports.register = function(server, options, next){

	server.route([
        //主页
        {
            method: 'GET',
            path: '/',
            handler: function(request, reply){
				var info = {};
				server.plugins['models'].vehicles.get_vehicles(info,function(err,rows){
                    if (!err) {
						return reply.view("homePage",{"rows":rows,"vehicles":JSON.stringify(rows)});
					}else {
						return reply({"success":false,"message":rows.message});
					}
				});

            }
        },





	]);

    next();
};

exports.register.attributes = {
    name: 'gaode_controller'
};
