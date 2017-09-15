var Hapi = require('hapi');
// Create a server with a host and port
var server = new Hapi.Server();

// Setup the server with a host and port
server.connection({
    port: parseInt(process.env.PORT, 10) || 18037,
    host: '0.0.0.0'
});

// Setup the views engine and folder
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


// Export the server to be required elsewhere.
module.exports = server;

/*
    Load all plugins and then start the server.
    First: community/npm plugins are loaded
    Second: project specific plugins are loaded
 */
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



], function () {
    //Start the server
    server.start(function() {
        //Log to the console the host and port info
        console.log('Server started at: ' + server.info.uri);
    });
});
