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
        //获得所有车辆
        {
            method: "GET",
            path: '/get_vehicles_traces',
            handler: function(request, reply) {
				var params = request.query.params;
                var info = {};
                if (params) {
                    info = JSON.parse(params);
                }
				var info2 = {};
                var ep =  eventproxy.create("rows", "num",
					function(rows, num){

					return reply({"success":true,"rows":rows,"num":num,"service_info":service_info});
				});
                //查询所有渠道部门
                server.plugins['models'].gps_vehicles_traces.get_vehicles_traces(info,function(err,rows){
                    if (!err) {
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].gps_vehicles_traces.account_vehicles_traces(info,function(err,rows){
                    if (!err) {
						ep.emit("num", rows[0].num);
					}else {
						ep.emit("num", 0);
					}
				});
            }
        },
        //新增
        {
            method: 'POST',
            path: '/save_trace',
            handler: function(request, reply){
                var trace = request.payload.trace;
                trace = JSON.parse(trace);
                if (!trace.gps_id || !trace.longitude || !trace.latitude ||
                    !trace.direction || !trace.distance || !trace.speed || !trace.location || !trace.state || !trace.time) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
                // var trace = {
                //     "gps_id":1,
                //     "longitude":123.1212123231,
                //     "latitude":33.121232321312,
                //     "car_id":1,
                //     "direction":45,
                //     "distance":12313,
                //     "speed":100,
                //     "location":"呼兰路911弄",
                //     "state":1,
                //     "time":123433123
                // }

                server.plugins['models'].gps_vehicles_traces.save_trace(trace, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });

            }
        },
        //删除
        {
            method: 'POST',
            path: '/delete_trace',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].gps_vehicles_traces.delete_trace(id, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });
            }
        },
        //查询渠道
        {
            method: "GET",
            path: '/search_trace_byId',
            handler: function(request, reply) {
                var id = request.query.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }
                var info2 = {};
                var ep =  eventproxy.create("rows",
                    function(rows){

                    return reply({"success":true,"rows":rows,"service_info":service_info});
                });
                //查询渠道部门
                server.plugins['models'].gps_vehicles_traces.search_trace_byId(id,function(err,rows){
                    if (!err) {
                        ep.emit("rows", rows);
                    }else {
                        ep.emit("rows", []);
                    }
                });

            }
        },
        //gpsid
        {
            method: "GET",
            path: '/search_trace_by_gps',
            handler: function(request, reply) {
                var gps_id = request.query.gps_id;
                if (!gps_id) {
                    return reply({"success":false,"message":"gps_id null","service_info":service_info});
                }
                var info2 = {};
                var ep =  eventproxy.create("rows",
                    function(rows){

                    return reply({"success":true,"rows":rows,"service_info":service_info});
                });
                //查询渠道部门
                server.plugins['models'].gps_vehicles_traces.search_trace_by_gps(gps_id,function(err,rows){
                    if (!err) {
                        ep.emit("rows", rows);
                    }else {
                        ep.emit("rows", []);
                    }
                });

            }
        },
        //更新渠道
        {
            method: 'POST',
            path: '/update_trace',
            handler: function(request, reply){
				var trace = request.payload.trace;
                trace = JSON.parse(trace);
                if (!trace.gps_id || !trace.longitude || !trace.latitude ||
                    !trace.direction || !trace.distance || !trace.speed ||
					!trace.state || !trace.time) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                server.plugins['models'].gps_vehicles_traces.update_trace(trace, function(err,result){
                    if (result.affectedRows>0) {
                        return reply({"success":true,"service_info":service_info});
                    }else {
                        return reply({"success":false,"message":result.message,"service_info":service_info});
                    }
                });
            }
        },


	]);

    next();
};

exports.register.attributes = {
    name: 'vehicles_traces_controller'
};
