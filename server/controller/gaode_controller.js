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
var key = "0c053bde775595e8b1b3de340265f053";
var async = require('async');


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
//查地址
var get_location = function(location,cb){
	var url = "http://restapi.amap.com/v3/geocode/regeo?output=JSON&location=";
    url = url + location +"&key="+key;
    do_get_method(url,cb);
};
//得到汽车痕迹信息
var get_info = function(data,cb){
	var aj = data.aj;
	var aw = data.aw;
	var bj = data.bj;
	var bw = data.bw;
	var at = data.at;
	var bt = data.bt;
	var ti = math.eval(bt+'-'+at);

    if (ti==0) {
        var info = {
            "longitude":bj,
            "latitude":bw,
    		"direction":0,
    		"distance":0,
    		"speed":0,
            "time":bt,
            "state":0
    	};

        cb(info);
        return;
    }

	var time = math.eval(ti/3600000);

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

	var s =  math.eval(l/time);

    var state = 0;
    if (l>0) {
        state = 1;
    }

    var info= {
        "longitude":bj,
        "latitude":bw,
        "direction":d,
        "distance":l,
        "speed":s,
        "time":bt,
        "state":state
	};

	cb(info);
};
//简单算法
var get_data = function(data,cb){
  var pi = math.PI;
  var r = 6371;
  var aj = data.aj;
	var aw = data.aw;
	var bj = data.bj;
	var bw = data.bw;
	var at = data.at;
	var bt = data.bt;
	var ti = math.eval(bt+'-'+at);

  if (ti==0) {
      var info = {
          "longitude":bj,
          "latitude":bw,
      "direction":0,
      "distance":0,
      "speed":0,
          "time":bt,
          "state":0
    };

      cb(info);
      return;
  }
  //方向
  var c1 = math.eval('cos((90-'+bw+') deg)');
  var c2 = math.eval('cos((90-'+aw+') deg)');
  var s1 = math.eval('sin((90-'+bw+') deg)');
  var s2 = math.eval('sin((90-'+aw+') deg)');
  var c3 = math.eval('cos(('+bj+'-'+aj+') deg)');

  var cos_c = math.eval(c1*c2+s1*s2*c3);
  var cc = math.eval(cos_c+'^2');
  var cc = math.eval('1-'+cc);
  var sc = math.sqrt(cc);
  if (sc==0) {
    var d = 0;
  }else {
    var s3 = math.eval('sin(('+bj+'-'+aj+') deg)');
    var ss = math.eval(s1*s3/sc);

    var hu = math.eval('asin('+ss+')');

    var d = math.eval(hu/pi*180);
  }

  //距离，速度
  aj = math.eval(aj*pi/180);
  aw = math.eval(aw*pi/180);
  bj = math.eval(bj*pi/180);
  bw = math.eval(bw*pi/180);
  var a = math.eval(aj+'-'+bj);
  var b = math.eval(aw+'-'+bw);
  a = math.eval(a/2);
  a = math.eval('sin('+a+')');
  a = math.eval(a*a);
  b = math.eval(b/2);
  b = math.eval('sin('+b+')');
  b = math.eval(b*b);

  d1 = math.eval('cos('+aw+')');
  d2 = math.eval('cos('+bw+')');
  a = math.eval(a*d1*d2);
  b = math.eval(a+"+"+b);
  b = math.sqrt(b);
  b = math.eval('asin('+b+')');
  b = math.eval(b*2);

  l = math.eval(b*r);

  var time = math.eval(ti/3600);
  var s =  math.eval(l/time);
  var state = 0;
  if (l>0) {
      state = 1;
  }

  var info= {
      "longitude":data.bj,
      "latitude":data.bw,
      "direction":d,
      "distance":l,
      "speed":s,
      "time":bt,
      "state":state
};

cb(info);

};
//登入账号验证
var do_login = function(data, cb){
	var url = "http://139.196.148.40:18666/user/login_check";
	data.platform_code = "drp_pos";
	do_post_method(url,data,cb);
};
//获取当前login_cookie
var get_login_cookie = function(request){
	var login_cookie;
	if (request.state && request.state.cookie) {
		var cookie = request.state.cookie;
		if (cookie.login_cookie) {
			login_cookie = cookie.login_cookie;
		}
	}
	return login_cookie;
};

exports.register = function(server, options, next){
    var i18n = server.plugins.i18n;
    //新增，或者更新痕迹信息
    var do_trace = function(data,cb){
        if (!data.gps_id || !data.longitude || !data.latitude ||
            !data.direction || !data.speed || !data.location || !data.state || !data.time) {
            cb(true,"trace params wrong");
        }
        server.plugins['models'].gps_vehicles_traces.search_trace_by_gps(data.gps_id,function(err,rows){
            if (!err) {
                if (rows.length ==0) {
                    server.plugins['models'].gps_vehicles_traces.save_trace(data, function(err,result){
                        if (result.affectedRows>0) {
                            cb(false,null);
                        }else {
                            cb(true,result.message);
                        }
                    });
                }else {
                    server.plugins['models'].gps_vehicles_traces.update_trace(data, function(err,result){
                        if (result.affectedRows>0) {
                            cb(false,null);
                        }else {
                            cb(true,null);
                        }
                    });
                }
            }else {
                cb(true,rows.message);
            }
        });
    };
	server.route([
        //主页
        {
            method: 'GET',
            path: '/',
            handler: function(request, reply){
                var login_cookie = get_login_cookie(request);
				if (!login_cookie) {
					login_cookie = uuidV1();
				}
				var info = {};
				server.plugins['models'].vehicles.get_vehicles(info,function(err,rows){
                    if (!err) {
						var vehicles = rows;
						server.plugins['models'].gps_vehicles_traces.get_vehicles_traces(info,function(err,rows){
		                    if (!err) {
								var trace_map = {};
								for (var i = 0; i < rows.length; i++) {
									var trace = rows[i];
									trace_map[trace.gps_id] = trace;
								}
								for (var i = 0; i < vehicles.length; i++) {
									var vehicle = vehicles[i];
									if (trace_map[vehicle.gps_id]) {
										vehicle.time = trace_map[vehicle.gps_id].updated_at;
                                        if (trace_map[vehicle.gps_id].state ==1) {
                                            vehicle.state_name ="运动中";
                                        }else if (trace_map[vehicle.gps_id].state ==0) {
                                            vehicle.state_name ="静止";
                                        }
                                        vehicle.location = trace_map[vehicle.gps_id].location;
                                        vehicle.speed = trace_map[vehicle.gps_id].speed;
                                        vehicle.direction = trace_map[vehicle.gps_id].direction;
                                        vehicle.distance = trace_map[vehicle.gps_id].distance;

                                        vehicle.longitude = trace_map[vehicle.gps_id].longitude;
                                        vehicle.latitude = trace_map[vehicle.gps_id].latitude;
									}
								}

								return reply.view("homePage",{"rows":vehicles,"vehicles":JSON.stringify(vehicles),"login_cookie":JSON.stringify(login_cookie)});
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
        //car_info
        {
            method: 'GET',
            path: '/car_infos',
            handler: function(request, reply){
                var params = request.query.params;
                var info = {};
                if (params) {
                    info = params;
                    info = JSON.parse(params);
                }
				server.plugins['models'].vehicles.get_vehicles(info,function(err,rows){
                    if (!err) {
						var vehicles = rows;
						server.plugins['models'].gps_vehicles_traces.get_vehicles_traces(info,function(err,rows){
		                    if (!err) {
								var trace_map = {};
								for (var i = 0; i < rows.length; i++) {
									var trace = rows[i];
									trace_map[trace.gps_id] = trace;
								}
								for (var i = 0; i < vehicles.length; i++) {
									var vehicle = vehicles[i];
									if (trace_map[vehicle.gps_id]) {
										vehicle.time = trace_map[vehicle.gps_id].updated_at;
                                        if (trace_map[vehicle.gps_id].state ==1) {
                                            vehicle.state_name ="运动中";
                                        }else if (trace_map[vehicle.gps_id].state ==0) {
                                            vehicle.state_name ="静止";
                                        }
                                        vehicle.location = trace_map[vehicle.gps_id].location;
                                        vehicle.speed = trace_map[vehicle.gps_id].speed;
                                        vehicle.direction = trace_map[vehicle.gps_id].direction;
                                        vehicle.distance = trace_map[vehicle.gps_id].distance;
                                        vehicle.longitude = trace_map[vehicle.gps_id].longitude;
                                        vehicle.latitude = trace_map[vehicle.gps_id].latitude;
									}
								}
								return reply({"success":true,"rows":vehicles});
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
        //批量更新地址
        {
            method: 'GET',
            path: '/get_location_no_update',
            handler: function(request, reply){
				var info = {};
				server.plugins['models'].gps_vehicles_traces.get_location_no_update(function(err,rows){
                    if (!err) {
                        var update_fail = [];
                        var update_success = [];
                        async.eachLimit(rows,1, function(row, cb) {
                            var bj = row.longitude;
                        	var bw = row.latitude;
                            var location = [];
                            location.push(bj);
                            location.push(bw);
                            get_location(location,function(err,content){
                                if (content.status == 1) {
                                    row.location = content.regeocode.formatted_address;
                                    if (row.location == "" || !row.location) {
                                        row.location = "未知地址";
                                        server.plugins['models'].gps_vehicles_traces.update_location(row, function(err,result){
                                            if (result.affectedRows>0) {
                                                update_success.push(row.id);
                                                cb();
                                            }else {
                                                console.log(result.message);
            									update_fail.push(row.id);
                                                cb();
                                            }
                                        });
                                    }else {
                                        server.plugins['models'].gps_vehicles_traces.update_location(row, function(err,result){
                                            if (result.affectedRows>0) {
                                                update_success.push(row.id);
                                                cb();
                                            }else {
                                                console.log(result.message);
            									update_fail.push(row.id);
                                                cb();
                                            }
                                        });
                                    }
                                }else {
                                    console.log(content.info);
									update_fail.push(row.id);
                                    cb();
                                }
                            });

        				}, function(err) {
        					if (err) {
        						console.error("err: " + err);
        					}
        					return reply({"success":true,"success_num":update_success.length,"fail_ids":update_fail,"fail_num":update_fail.length,"service_info":service_info});
        				});

					}else {
						return reply({"success":false,"message":rows.message});
					}
				});
            }
        },
        //查地址
        {
            method: 'GET',
            path: '/get_location',
            handler: function(request, reply){
                var bj = 0.000000002593;
            	var bw = 0.000000002593;
                // var bj = 116.481488;
            	// var bw = 39.990464;
                var location = [];
                location.push(bj);
                location.push(bw);
                get_location(location,function(err,content){
                    if (content.status == 1) {
                        return reply({"success":true,"message":content.regeocode.formatted_address});
                    }else {
                        return reply({"success":false,"message":content.info});
                    }
                });


            }
        },
        //计算简单
        {
            method: 'GET',
            path: '/get_data',
            handler: function(request, reply){
              var data = {
                "aj":121.627971130000,
                "aw":31.274888850000,
                "bj":121.627971090000,
                "bw":31.274889030000,
                "at":1507690362,
                "bt":1507690363
              }
              get_data(data,function(data){
                  data.gps_id = 12345678;
                  if (!data.gps_id || !data.longitude || !data.latitude || !data.state || !data.time) {
                      return reply({"success":false,"message":"trace params wrong","service_info":service_info});
                  }
                  server.plugins['models'].gps_vehicles_traces.search_trace_by_gps(data.gps_id,function(err,rows){
                      if (!err) {
                          if (rows.length ==0) {
                              server.plugins['models'].gps_vehicles_traces.save_trace(data, function(err,result){
                                  if (result.affectedRows>0) {
                                      return reply({"success":true,"message":"add new trace","service_info":service_info});
                                  }else {
                                      return reply({"success":false,"message":result.mesmessage,"service_info":service_info});
                                  }
                              });
                          }else {
                              server.plugins['models'].gps_vehicles_traces.update_trace(data, function(err,result){
                                  if (result.affectedRows>0) {
                                      return reply({"success":true,"message":"update success ","service_info":service_info});
                                  }else {
                                      return reply({"success":false,"message":result.mesmessage,"service_info":service_info});
                                  }
                              });
                          }
                      }else {
                          return reply({"success":false,"message":rows.mesmessage,"service_info":service_info});
                      }
                  });
              });

            }
        },
		//计算方向
        {
            method: 'GET',
            path: '/get_direction',
            handler: function(request, reply){

				var aj = 121.627971130000;
				var aw = 31.274888850000;
				var bj = 121.627971090000;
				var bw = 31.274889030000;

				var c1 = math.eval('cos((90-'+bw+') deg)');
				var c2 = math.eval('cos((90-'+aw+') deg)');
				var s1 = math.eval('sin((90-'+bw+') deg)');
				var s2 = math.eval('sin((90-'+aw+') deg)');
				var c3 = math.eval('cos(('+bj+'-'+aj+') deg)');

				var cos_c = math.eval(c1*c2+s1*s2*c3);
				var cc = math.eval(cos_c+'^2');
				var cc = math.eval('1-'+cc);
				var sc = math.sqrt(cc);
        if (sc==0) {
          var d = 0;
          return reply({"success":true,"d":d});
        }else {
          var s3 = math.eval('sin(('+bj+'-'+aj+') deg)');
  				var ss = math.eval(s1*s3/sc);

  				var hu = math.eval('asin('+ss+')');

  				var pi = math.PI;

  				var d = math.eval(hu/pi*180);

  				var r = 6371;
  				var l =  math.eval(hu*r);



  				return reply({"success":true,"d":d,"hu":hu,"l":l});
        }

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
                                   if (rows[0].longitude == info.longitude || rows[0].latitude == info.latitude  ) {
                                       return reply({"success":false,"message":"no move","service_info":service_info});
                                   }else {
                                       info.id = rows[0].id;
    								   var old_recode = rows[0];
    								   server.plugins['models'].lastest_records.update_lastest_record(info, function(err,result){
    				                       if (result.affectedRows>0) {
                                               if (!rows[0].time) {
                                                   rows[0].time = info.time;
                                               }
    										   var data = {
    											   "aj":rows[0].longitude,
    											   "aw":rows[0].latitude,
    											   "bj":info.longitude,
    											   "bw":info.latitude,
    											   "at":rows[0].time,
    											   "bt":info.time
    										   }
    										   get_data(data,function(data){
                                                   data.gps_id = info.gps_id;
                                                   if (!data.gps_id || !data.longitude || !data.latitude || !data.state || !data.time) {
                                                       return reply({"success":false,"message":"trace params wrong","service_info":service_info});
                                                   }
                                                   server.plugins['models'].gps_vehicles_traces.search_trace_by_gps(data.gps_id,function(err,rows){
                                                       if (!err) {
                                                           if (rows.length ==0) {
                                                               server.plugins['models'].gps_vehicles_traces.save_trace(data, function(err,result){
                                                                   if (result.affectedRows>0) {
                                                                       return reply({"success":true,"message":"add new trace","service_info":service_info});
                                                                   }else {
                                                                       return reply({"success":false,"message":result.mesmessage,"service_info":service_info});
                                                                   }
                                                               });
                                                           }else {
                                                               server.plugins['models'].gps_vehicles_traces.update_trace(data, function(err,result){
                                                                   if (result.affectedRows>0) {
                                                                       return reply({"success":true,"message":"update success ","service_info":service_info});
                                                                   }else {
                                                                       return reply({"success":false,"message":result.mesmessage,"service_info":service_info});
                                                                   }
                                                               });
                                                           }
                                                       }else {
                                                           return reply({"success":false,"message":rows.mesmessage,"service_info":service_info});
                                                       }
                                                   });
    										   });
    				                       }else {
    				                           return reply({"success":false,"message":"location no change","service_info":service_info});
    				                       }
    				                   });
                                   }
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
        //用户登入
		{
			method: 'GET',
			path: '/login',
			handler: function(request, reply){
				return reply.view("login");
			}
		},
        //pos登入
        {
            method: 'POST',
            path: '/do_login',
            handler: function(request, reply){
                var data = {};
                data.username = request.payload.username;
                data.password = request.payload.password;
                data.org_code = "ioio";

                do_login(data, function(err,row){
                    if (!err) {
                        var cookie = request.state.cookie;
                        if (!cookie) {
                            cookie = {};
                        }
                        cookie.login_cookie = uuidV1();
                        return reply({"success":true,"service_info":service_info}).state('cookie', cookie, {ttl:1000*365*24*60*60*1000});
                    } else {
                        return reply({"success":false,"message":i18n._n(row.message)});
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
