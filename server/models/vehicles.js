var _ = require('lodash');
var EventProxy = require('eventproxy');

var vehicles = function(server) {
	return {
		//获得所有车辆
		get_vehicles : function(info, cb){
            var query = `select id, gps_id, code, plate_number, color, car_brand,
                state, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at,
                updated_at from vehicles where flag = 0
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
		account_vehicles : function(info, cb){
			var query = `select count(1) num
                from vehicles where flag = 0
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
		save_vehicle : function(vehicle, cb){
			var query = `insert into vehicles (gps_id, code, plate_number,
                color, car_brand, state, created_at, updated_at, flag )
                values
                (?, ?, ?,
                ?, ?, "新建", now(), now(), 0
                )
			`;
			var coloums = [vehicle.gps_id, vehicle.code, vehicle.plate_number,
                vehicle.color, vehicle.car_brand];
			server.plugins['mysql'].query(query, coloums, function(err, results) {
				if (err) {
					console.log(err);
					cb(true,results);
					return;
				}
				cb(false,results);
			});
		},
		//更新
		update_vehicle:function(vehicle, cb){
			var query = `update vehicles set gps_id =?, code =?, plate_number =?,
                color =?, car_brand =?, state =?, updated_at = now()
			    where id = ? and flag = 0
			`;
			var coloums = [vehicle.gps_id, vehicle.code, vehicle.plate_number,           vehicle.color, vehicle.car_brand, vehicle.state, vehicle.id];
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
		search_vehicle_byId : function(id, cb){
			var query = `select id, gps_id, code, plate_number, color, car_brand,
                state, DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at, updated_at, flag
			    from vehicles where flag = 0 and id = ?
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
		//删除
		delete_vehicle:function(id, cb){
			var query = `update vehicles set flag = 1, updated_at = now()
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
        //更新状态
        update_vehicle_state:function(id,state, cb){
            var query = `update vehicles set state = ?, updated_at = now()
            where id = ? and flag = 0
            `;
            var coloums = [state, id];
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

module.exports = vehicles;
