var Hapi = require('hapi');
var server = new Hapi.Server();

server.connection({
    port: parseInt(process.env.PORT, 10) || 18037,
    host: '0.0.0.0'
});

server.register(require('vision'), (err) => {
    if (err) {
        throw err;
    }

    var swig = require('swig');
    swig.setDefaults({ cache: false });

    server.views({
        engines: {
            html: swig
        },
        isCached: false,
        relativeTo: __dirname,
        encoding: 'utf8',
        path: './server/views'
    });
});

server.state('cookie', {
    ttl: null,
    isSecure: false,
    isHttpOnly: true,
    encoding: 'base64json',
    clearInvalid: false, // remove invalid cookies
    strictHeader: true // don't allow violations of RFC 6265
});

module.exports = server;

server.register([
	{
        register: require("good"),
        options: {
            ops: false,
            reporters: {
                myConsoleReporter: [{
                    module: 'good-console'
                }, 'stdout']
            }
        }
    },
    {
      register: require('./server/db/db_mysql.js')
    },
    {
        register: require('./server/utils/g.js'),
        options: require('./view_globals.js')
    },
	{
      register: require('./server/assets/index.js')
    },
    {
      register: require('./server/models/models.js')
    },
    {
      register: require('./server/controller/gaode_controller.js')
    },
    {
      register: require('./server/controller/vehicles_controller.js')
    },
    {
      register: require('./server/controller/gps_equipments_controller.js')
    },
    {
      register: require('./server/controller/gps_history_controller.js')
    },
    {
      register: require('./server/controller/lastest_records_controller.js')
    },
    {
      register: require('./server/controller/vehicles_traces_controller.js')
    },
    {
      register: require('./server/socket/socket_io.js')
    },

], function () {
    //Start the server
    server.start(function() {
        //Log to the console the host and port info
        console.log('Server started at: ' + server.info.uri);
    });
});
