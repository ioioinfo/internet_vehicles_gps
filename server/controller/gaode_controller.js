// Base routes for item..
const uu_request = require('../utils/uu_request');
const uuidV1 = require('uuid/v1');
var eventproxy = require('eventproxy');
var service_info = "vehicles GPS service";
var math = require('mathjs');
var bigmath = math.create({
  number: 'BigNumber',  // Choose 'number' (default), 'BigNumber', or 'Fraction'
  precision: 32         // 64 by default, only applicable for BigNumbers
});

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

var get_info = function(data,cb){

	var aj = data.aj;
	var aw = data.aw;
	var bj = data.bj;
	var bw = data.bw;
	var at = data.at;
	var bt = data.bt;
	var time = math.eval(bt+'-'+at);
	time = math.eval(bt/3600000);
	console.log("time:"+time);
	console.log("data:"+JSON.stringify(data));

	var c1 = math.eval('cos((90-'+bw+') deg)');
	var c2 = math.eval('cos((90-'+aw+') deg)');
	var s1 = math.eval('sin((90-'+bw+') deg)');
	var s2 = math.eval('sin((90-'+aw+') deg)');
	var c3 = math.eval('cos(('+bj+'-'+aj+') deg)');

	var cos_c = math.eval(c1*c2+s1*s2*c3);
	var cc = math.eval(cos_c+'^2');
	var cc = math.eval('1-'+cc);
	var sc = math.sqrt(cc);

	var s3 = math.eval('sin(('+bj+'-'+aj+') deg)');
	var ss = math.eval(s1*s3/sc);

	var hu = math.eval('asin('+ss+')');

	var pi = math.PI;

	var d = math.eval(hu/pi*180);

	var r = 6371;
	var l =  math.eval(hu*r);
	l = math.abs(l);
	console.log("d:"+d);
	var s =  math.eval(l/time);
	var info = {
		"direction":d,
		"distance":l,
		"speed":s
	};
	console.log("data:"+JSON.stringify(info));
	cb(info);
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
						var vehicles = rows;
						server.plugins['models'].lastest_records.get_lastest_records(info,function(err,rows){
		                    if (!err) {
								var drive_map = {};
								for (var i = 0; i < rows.length; i++) {
									var drive = rows[i];
									drive_map[drive.gps_id] = drive;
								}
								for (var i = 0; i < vehicles.length; i++) {
									var vehicle = vehicles[i];
									if (drive_map[vehicle.gps_id]) {
										vehicle.time = drive_map[vehicle.gps_id].time;
									}
								}

								return reply.view("homePage",{"rows":vehicles,"vehicles":JSON.stringify(vehicles)});
							}else {
								return reply({"success":false,"message":rows.message});
							}
						});
					}else {
						return reply({"success":false,"message":rows.message});
					}
				});
            }
        },
		//计算方向
        {
            method: 'GET',
            path: '/get_direction',
            handler: function(request, reply){
				var aj = 121.439943000000;
				var aw = 31.343803000000;
				var bj = 180.438083000000;
				var bw = 180.347179000000;

				var c1 = math.eval('cos((90-'+bw+') deg)');
				var c2 = math.eval('cos((90-'+aw+') deg)');
				var s1 = math.eval('sin((90-'+bw+') deg)');
				var s2 = math.eval('sin((90-'+aw+') deg)');
				var c3 = math.eval('cos(('+bj+'-'+aj+') deg)');

				var cos_c = math.eval(c1*c2+s1*s2*c3);
				var cc = math.eval(cos_c+'^2');
				var cc = math.eval('1-'+cc);
				var sc = math.sqrt(cc);

				var s3 = math.eval('sin(('+bj+'-'+aj+') deg)');
				var ss = math.eval(s1*s3/sc);

				var hu = math.eval('asin('+ss+')');

				var pi = math.PI;

				var d = math.eval(hu/pi*180);

				var r = 6371;
				var l =  math.eval(hu*r);



				return reply({"success":true,"d":d,"hu":hu,"l":l});
            }
        },
		//接收GPS信息,新增历史记录，时时更新
        {
            method: 'POST',
            path: '/receive_gps_info',
            handler: function(request, reply){
				var info = request.payload.info;
				if (!info) {
					return reply({"success":false,"message":"params wrong","service_info":service_info});
				}
				info = JSON.parse(info);
				if (!info.gps_id || !info.longitude || !info.latitude
                     || !info.time) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }
				server.plugins['models'].gps_history.save_history_record(info, function(err,result){
                    if (result.affectedRows>0) {
						server.plugins['models'].lastest_records.search_lastest_by_gps(info.gps_id,function(err,rows){
		                    if (!err) {
								//0新增，否者更新
		                       if (rows.length ==0) {
								   server.plugins['models'].lastest_records.save_lastest_record(info, function(err,result){
				                       if (result.affectedRows>0) {
				                           return reply({"success":true,"service_info":service_info});
				                       }else {
				                           return reply({"success":false,"message":result.message,"service_info":service_info});
				                       }
				                   });
		                       }else {
								   info.id = rows[0].id;
								   var old_recode = rows[0];
								   server.plugins['models'].lastest_records.update_lastest_record(info, function(err,result){
				                       if (result.affectedRows>0) {
										   var data = {
											   "aj":rows[0].longitude,
											   "aw":rows[0].latitude,
											   "bj":info.longitude,
											   "bw":info.latitude,
											   "at":rows[0].time,
											   "bt":info.time
										   }
										   get_info(data,function(data){

											   return reply({"success":true,"info":data,"service_info":service_info});
										   });
				                       }else {
				                           return reply({"success":false,"message":result.message,"service_info":service_info});
				                       }
				                   });
		                       }
		                    }else {
		                        return reply({"success":false,"message":rows.message,"service_info":service_info});
		                    }
		                });
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
    name: 'gaode_controller'
};
