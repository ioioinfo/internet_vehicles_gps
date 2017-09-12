var _ = require('lodash');
var EventProxy = require('eventproxy');

var gps_equipments = function(server) {
	return {
		//获得所有GPS
		get_equipments : function(info, cb){
            var query = `select id, code, state,
                DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at,
                updated_at from gps_equipments where flag = 0
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
		account_equipments : function(info, cb){
			var query = `select count(1) num
                from gps_equipments where flag = 0
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
		save_equipment : function(equipment, cb){
			var query = `insert into gps_equipments (code, state, created_at,
                updated_at, flag )
                values
                (?, "新建", now(),
                now(), 0
                )
			`;
			var coloums = [equipment.code];
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
		update_equipment:function(equipment, cb){
			var query = `update gps_equipments set code =?, state =?,
                updated_at = now()
			    where id = ? and flag = 0
			`;
			var coloums = [equipment.code, equipment.state, equipment.id];
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
		search_equipment_byId : function(id, cb){
			var query = `select id, code, state,
                DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at,
                updated_at, flag
			    from gps_equipments where flag = 0 and id = ?
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
		delete_equipment:function(id, cb){
			var query = `update gps_equipments set flag = 1, updated_at = now()
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
        update_equipment_state:function(id,state, cb){
            var query = `update gps_equipments set state = ?, updated_at = now()
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

module.exports = gps_equipments;
