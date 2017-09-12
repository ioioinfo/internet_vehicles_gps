var _ = require('lodash');
var EventProxy = require('eventproxy');

var gps_history = function(server) {
	return {
		//获得所有GPS历史
		get_history_records : function(info, cb){
            var query = `select id, gps_id, longitude, latitude,
                DATE_FORMAT(time,'%Y-%m-%d %H:%i:%S')time,
                DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at,
                updated_at from gps_history where flag = 0
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
		account_history_records : function(info, cb){
			var query = `select count(1) num
                from gps_history where flag = 0
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
		save_history_record : function(record, cb){
			var query = `insert into gps_history (gps_id, longitude, latitude,
                time, created_at, updated_at, flag )
                values
                (?, ?, ?,
                ?, now(), now(), 0
                )
			`;
			var coloums = [record.gps_id,record.longitude,record.latitude,record.time];
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
		search_history_byId : function(id, cb){
			var query = `select id, gps_id, longitude, latitude,
                DATE_FORMAT(time,'%Y-%m-%d %H:%i:%S')time,
                DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at
			    from gps_history where flag = 0 and id = ?
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
		delete_history_record:function(id, cb){
			var query = `update gps_history set flag = 1, updated_at = now()
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


	};
};

module.exports = gps_history;
