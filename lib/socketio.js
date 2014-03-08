var http = require('http');

module.exports = function(app) {

  var server = http.createServer(app);
  var socketIO = require('socket.io').listen(server, {
    'log level': 3
  });

  var maps = {};

  socketIO.sockets.on('connection', function(socket) {
    console.log('connect to something');

    socket.on('login', function(data){
      if(data.mapId && data.user){
        if(maps[data.mapId]){
          maps[data.mapId].users[socket.id] = data.user;
        }else{
          maps[data.mapId] = {users: {}};
          maps[data.mapId].users[socket.id] = data.user;
        }
        socketIO.sockets.emit(data.mapId + '-users', maps[data.mapId]);
      }
    });

    socket.on('mapMovement', function(data){
      if(data.mapId && data.event){
        socket.broadcast.emit(data.mapId + '-mapMovement',{'event': data.event}); 
      }
    });

    socket.on('mapDraw', function(data){
      if(data.mapId && data.event){
        socket.broadcast.emit(data.mapId + '-mapDraw',{'event': data.event}); 
      }
    });



    socket.on('disconnect', function() {
      for(var key in maps){
        if(maps[key].users && maps[key].users[socket.id]){
          delete maps[key].users[socket.id];
          socketIO.sockets.emit(key + '-users', maps[key]);
        }
      }
    });
  });

  return server;
};
