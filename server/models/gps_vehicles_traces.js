var _ = require('lodash');
var EventProxy = require('eventproxy');

var gps_vehicles_traces = function(server) {
	return {
		//获得所有GPS历史
		get_vehicles_traces : function(info, cb){
            var query = `select id, gps_id, longitude, latitude, car_id,
                direction, distance, speed, location, state, time,
                DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at,
                DATE_FORMAT(updated_at,'%Y-%m-%d %H:%i:%S')updated_at from gps_vehicles_traces where flag = 0
            `;

			if (info.thisPage) {
                var offset = info.thisPage-1;
                if (info.everyNum) {
                    query = query + " limit " + offset*info.everyNum + "," + info.everyNum;
                }else {
                    query = query + " limit " + offset*20 + ",20";
                }
            }
            server.plugins['mysql'].query(query, function(err, results) {
                if (err) {
                    console.log(err);
                    cb(true,results);
                    return;
                }
                cb(false,results);
            });
        },
		account_vehicles_traces : function(info, cb){
			var query = `select count(1) num
                from gps_vehicles_traces where flag = 0
			`;

			server.plugins['mysql'].query(query, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//获得所有地址没有更新的
		get_location_no_update : function(cb){
            var query = `select id, longitude, latitude
				from gps_vehicles_traces where flag = 0
				and updated_at > location_updated or location_updated is null
            `;
            server.plugins['mysql'].query(query, function(err, results) {
                if (err) {
                    console.log(err);
                    cb(true,results);
                    return;
                }
                cb(false,results);
            });
        },
		// 保存预算
		save_trace : function(trace, cb){
			var query = `insert into gps_vehicles_traces (gps_id, longitude, latitude,
                car_id, direction, distance, speed, location, state,
                time, created_at, updated_at, flag )
                values
                (?, ?, ?,
                ?, ?, ?, ?, ?, ?,
                ?, now(), now(), 0
                )
			`;
			var coloums = [trace.gps_id,trace.longitude,trace.latitude,
                trace.car_id, trace.direction, trace.distance, trace.speed, trace.location, trace.state, trace.time
            ];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//查询预算
		search_trace_byId : function(id, cb){
			var query = `select id, gps_id, longitude, latitude, car_id,
                direction, distance, speed, location, state, time,
                DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at
			    from gps_vehicles_traces where flag = 0 and id = ?
			`;
			server.plugins['mysql'].query(query,[id],function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
        search_trace_by_gps : function(gps_id, cb){
			var query = `select id, gps_id, longitude, latitude, car_id,
                direction, distance, speed, location, state, time,
                DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at
			    from gps_vehicles_traces where flag = 0 and gps_id = ?
			`;
			server.plugins['mysql'].query(query,[gps_id],function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//删除
		delete_trace: function(id, cb){
			var query = `update gps_vehicles_traces set flag = 1, updated_at = now()
				where id = ? and flag =0
				`;
			server.plugins['mysql'].query(query, [id], function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
        //更新
        update_trace:function(trace, cb){
            var query = `update gps_vehicles_traces set gps_id =?, longitude =?,
                latitude =?, car_id =?, direction =?, distance =?, speed =?,
                state =?, time =?, updated_at = now()
                where gps_id = ? and flag = 0
            `;
            var coloums =[trace.gps_id, trace.longitude,
                trace.latitude, trace.car_id, trace.direction, trace.distance,
                trace.speed, trace.state, trace.time, trace.gps_id
            ];
            server.plugins['mysql'].query(query, coloums, function(err, results) {
                if (err) {
                    console.log(err);
                    cb(true,results);
                    return;
                }
                cb(false,results);
            });
        },
		//更新地址
		update_location:function(trace, cb){
            var query = `update gps_vehicles_traces set location =?,
				location_updated = now()
                where id = ? and flag = 0
            `;
            var coloums =[trace.location, trace.id];
            server.plugins['mysql'].query(query, coloums, function(err, results) {
                if (err) {
                    console.log(err);
                    cb(true,results);
                    return;
                }
                cb(false,results);
            });
        },

	};
};

module.exports = gps_vehicles_traces;
