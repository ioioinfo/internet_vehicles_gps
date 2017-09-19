var _ = require('lodash');
var EventProxy = require('eventproxy');

var lastest_records = function(server) {
	return {
		//获得所有GPS历史
		get_lastest_records : function(info, cb){
            var query = `select id, gps_id, longitude, latitude, time,
                DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at,
                updated_at from lastest_records where flag = 0
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
		account_lastest_records : function(info, cb){
			var query = `select count(1) num
                from lastest_records where flag = 0
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
		save_lastest_record : function(record, cb){
			var query = `insert into lastest_records (gps_id, longitude, latitude,
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
		search_lastest_byId : function(id, cb){
			var query = `select id, gps_id, longitude, latitude, time,
                DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at
			    from lastest_records where flag = 0 and id = ?
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
		//查询
		search_lastest_by_gps : function(gps_id, cb){
			var query = `select id, gps_id, longitude, latitude, time,
                DATE_FORMAT(created_at,'%Y-%m-%d %H:%i:%S')created_at
			    from lastest_records where flag = 0 and gps_id = ?
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
		delete_lastest_record:function(id, cb){
			var query = `update lastest_records set flag = 1, updated_at = now()
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
        update_lastest_record:function(record, cb){
            var query = `update lastest_records set gps_id =?, longitude =?,
                latitude =?, time =?, updated_at = now()
                where id = ? and flag = 0
            `;
            var coloums = [record.gps_id,record.longitude,record.latitude,record.time,record.id];
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

module.exports = lastest_records;
