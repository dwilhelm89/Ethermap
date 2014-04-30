var http = require('http'),
    couchdbHandler = require('./dbHandler.js');

module.exports = function(app) {

    var server = http.createServer(app);
    var socketIO = require('socket.io').listen(server, {
        'log level': 2
    });

    var maps = {};

    socketIO.sockets.on('connection', function(socket) {

        socket.on('tester', function(data){
            socketIO.sockets.emit('tester-commands', data);
        });

        socket.on('login', function(data) {
            if (data.mapId && data.user) {
                if (maps[data.mapId]) {
                    maps[data.mapId].users[socket.id] = data.user;
                } else {
                    maps[data.mapId] = {
                        users: {}
                    };
                    maps[data.mapId].users[socket.id] = data.user;
                }
                socketIO.sockets.emit(data.mapId + '-users', maps[data.mapId]);
            }
        });

        socket.on('mapMovement', function(data) {
            if (data.mapId && data.event) {
                data.event.userId = socket.id;
                socket.broadcast.emit(data.mapId + '-mapMovement', {
                    'event': data.event
                });
            }
        });

        socket.on('mapDraw', function(data) {
            if (data.mapId && data.event) {
                couchdbHandler.saveFeature(data.mapId, data.event);
                socket.broadcast.emit(data.mapId + '-mapDraw', {
                    'event': data.event
                });
            }
        });

        socket.on('chat', function(data) {
            if (data.mapId && data.message && data.user) {
                socketIO.sockets.emit(data.mapId + '-chat', {
                    'user': data.user,
                    'message': data.message
                });
            }
        });

        socket.on('revertFeature', function(data) {
            console.log(data);
            if (data.mapId && data.fid && data.toRev && data.user) {
                couchdbHandler.revertFeature(data.mapId, data.fid, data.toRev, data.user, function(err, res, feature) {
                    if (err) {
                        socketIO.sockets.emit(data.mapId + '-mapDraw', err);
                    } else {
                        var drawEvent = {
                            'action': 'edited',
                            'feature': feature,
                            'fid': data.fid,
                            'user': data.user
                        };
                        socketIO.sockets.emit(data.mapId + '-mapDraw', {
                            'event': drawEvent
                        });
                    }
                });
            }
        });


        socket.on('restoreDeletedFeature', function(data) {
            if (data.mapId && data.fid && data.user) {
                console.log("requirement existing");
                couchdbHandler.restoreDeletedFeature(data.mapId, data, function(err, res) {
                    if (err) {
                        socketIO.sockets.emit(data.mapId + '-mapDraw', err);
                    } else {
                        var drawEvent = {
                            'action': 'created',
                            'feature': res,
                            'fid': data.fid,
                            'user': data.user
                        };
                        socketIO.sockets.emit(data.mapId + '-mapDraw', {
                            'event': drawEvent
                        });
                    }
                    
                });
            }
        });

        socket.on('disconnect', function() {
            for (var key in maps) {
                if (maps[key].users && maps[key].users[socket.id]) {
                    delete maps[key].users[socket.id];
                    socketIO.sockets.emit(key + '-users', maps[key]);
                }
            }
        });
    });

    return server;
};
