// Base routes for default index/root path, about page, 404 error pages, and others..
exports.register = function(server, options, next){

	// server.expose('car_customers', require('./car_customers.js')(server));

	next();
}

exports.register.attributes = {
    name: 'models'
};
