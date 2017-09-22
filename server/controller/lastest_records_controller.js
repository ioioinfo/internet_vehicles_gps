// Base routes for item..
const gps = require('../utils/gps');
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
            path: '/get_lastest_records',
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
                server.plugins['models'].lastest_records.get_lastest_records(info,function(err,rows){
                    if (!err) {
						for (var i = 0; i < rows.length; i++) {
							var row = rows[i];
							var point = gps.gcj_encrypt(row.latitude,row.longitude);
							row.latitude = point.latitude;
							row.longitude = point.longitude;
						}
						ep.emit("rows", rows);
					}else {
						ep.emit("rows", []);
					}
				});
				server.plugins['models'].lastest_records.account_lastest_records(info,function(err,rows){
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
            path: '/save_lastest_record',
            handler: function(request, reply){
                var record = request.payload.lastest_record;
                record = JSON.parse(record);
                if (!record.gps_id || !record.longitude || !record.latitude
                     || !record.time) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                server.plugins['models'].lastest_records.save_lastest_record(record, function(err,result){
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
            path: '/delete_lastest_record',
            handler: function(request, reply){
                var id = request.payload.id;
                if (!id) {
                    return reply({"success":false,"message":"id null","service_info":service_info});
                }

                server.plugins['models'].lastest_records.delete_lastest_record(id, function(err,result){
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
            path: '/search_lastest_byId',
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
                server.plugins['models'].lastest_records.search_lastest_byId(id,function(err,rows){
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
            path: '/update_lastest_record',
            handler: function(request, reply){
                var record = request.payload.lastest_record;
                record = JSON.parse(record);
                if (!record.gps_id || !record.longitude || !record.latitude
                     || !record.time || !record.id) {
                    return reply({"success":false,"message":"params wrong","service_info":service_info});
                }

                server.plugins['models'].lastest_records.update_lastest_record(record, function(err,result){
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
    name: 'lastest_records_controller'
};
