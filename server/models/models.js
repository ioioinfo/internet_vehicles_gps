// Base routes for default index/root path, about page, 404 error pages, and others..
exports.register = function(server, options, next){

	server.expose('vehicles', require('./vehicles.js')(server));
	server.expose('gps_equipments', require('./gps_equipments.js')(server));

	next();
}

exports.register.attributes = {
    name: 'models'
};
