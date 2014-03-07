var http = require('http');

module.exports = function(app) {

  var server = http.createServer(app);
  var socketIO = require('socket.io').listen(server, {
    'log level': 3
  });
  socketIO.sockets.on('connection', function(socket) {
    console.log('connect to something');



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
      console.log('bye bye');
    });
  });

  return server;
};
