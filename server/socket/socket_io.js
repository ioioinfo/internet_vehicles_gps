const uu_request = require('../utils/uu_request');
const uuidV1 = require('uuid/v1');
var eventproxy = require('eventproxy');
var service_info = "vehicles GPS service";
var socket_map = {};

exports.register = function(server, options, next){

    var io = require('socket.io')(server.listener);

    io.on('connection', function (socket) {
        console.log('New connection!');
        socket.emit('hello', 'can you hear me?', 1, 2, 'abc');

        socket.on('cookie', function(msg){

          socket_map[msg] = socket.id;
          io.emit('chat message', msg);
        });
        socket.on('chat message', function(msg){
          console.log('io.sockets:'+io.sockets);

          io.emit('chat message', msg);
        });

        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
    });

    server.route([
        //主页
        {
            method: 'GET',
            path: '/socket',
            handler: function(request, reply){
                var cookie = uuidV1();
                reply.view('index',{"cookie":JSON.stringify(cookie)});
            }
        },
        {
            method: 'GET',
            path: '/receive',
            handler: function(request, reply){
                var cookie = request.query.cookie;
                var msg = request.query.msg;
                console.log(msg);
                io.sockets.connected[socket_map[cookie]].emit('chat message', msg);
                return reply({"success":true});
            }
        },

    ]);

    next();
};

exports.register.attributes = {
    name: 'socket_io'
};
