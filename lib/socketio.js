var http = require('http'),
  couchdbHandler = require('./dbHandler.js');

/**
 * Initializes the Websocket listeners.
 * @param  {Object} app The express app
 * @return {Object}     Websocket http server
 */
module.exports = function(app) {

  var server = http.createServer(app);
  var socketIO = require('socket.io').listen(server);

  socketIO.enable('browser client minification'); // send minified client
  socketIO.enable('browser client etag'); // apply etag caching logic based on version number
  socketIO.enable('browser client gzip'); // gzip the file
  socketIO.set('log level', 1); // reduce logging

  // enable all transports (optional if you want flashsocket support, please note that some hosting
  // providers do not allow you to create servers that listen on a port different than 80 or their
  // default port)
  socketIO.set('transports', [
    'websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'
  ]);

  var maps = {};

  socketIO.sockets.on('connection', function(socket) {

    function storeMapAction(data, action) {
      data.action = action;
      data.userId = socket.id;
      couchdbHandler.recordMapAction(data.mapId, data);
    }

    /**
     * Emits test commands to all clients. Used for debugging/ load tests
     * @param  {Object} data tester data for the TesterService methods
     */
    socket.on('tester', function(data) {
      socketIO.sockets.emit('tester-commands', data);
    });

    /**
     * Login method stores the current users of a map and emits the userlist to all clients of a map
     */
    socket.on('login', function(data) {
      if (data.mapId && data.user) {
        storeMapAction(data, 'connect');
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

    /**
     * Receives map movements and emits the movement to all clients of the map
     */
    socket.on('mapMovement', function(data) {
      if (data.mapId && data.event) {
        storeMapAction(data, 'move');
        data.event.userId = socket.id;
        socket.broadcast.emit(data.mapId + '-mapMovement', {
          'event': data.event
        });
      }
    });

    /**
     * Receives drawn features and emits the features to all clients of the map
     */
    socket.on('mapDraw', function(data) {
      if (data.mapId && data.event) {
        storeMapAction(data, 'draw');
        couchdbHandler.saveFeature(data.mapId, data.event);
        socket.broadcast.emit(data.mapId + '-mapDraw', {
          'event': data.event
        });
      }
    });

    /**
     * Receives an event if a user starts/ends the edit mode and emits the message to all clients of the map
     */
    socket.on('editFeature', function(data) {
      if (data.mapId && data.user && data.fid) {
        socket.broadcast.emit(data.mapId + '-editFeature', data);
        storeMapAction(data, 'editMode');
      }
    });

    /**
     * Receives chat messages and emits the messages to all clients of the map
     */
    socket.on('chat', function(data) {
      if (data.mapId && data.message && data.user) {
        storeMapAction(data, 'chat');
        socketIO.sockets.emit(data.mapId + '-chat', {
          'user': data.user,
          'message': data.message
        });
      }
    });

    /**
     * Receives features which should be reverted.
     * Calls the dbHandler to revert the feature and emits the reverted feature as a new draw event
     */
    socket.on('revertFeature', function(data) {
      if (data.mapId && data.fid && data.toRev && data.user) {
        storeMapAction(data, 'revert');
        couchdbHandler.revertFeature(data.mapId, data.fid, data.toRev, data.user, function(err, res, feature) {
          if (err) {
            socketIO.sockets.emit(data.mapId + '-mapDraw', err);
          } else {
            var drawEvent = {
              'action': 'reverted',
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

    /**
     * Receives deleted features which should be restored.
     * Calls the dbHandler to restore the feature and emits the restored feature as a new draw event
     */
    socket.on('restoreDeletedFeature', function(data) {
      if (data.mapId && data.fid && data.user) {
        storeMapAction(data, 'restored');
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

    /**
     * Removes a user from the users list and emits the new userlist to the map clients
     */
    socket.on('disconnect', function() {
      for (var key in maps) {
        if (maps[key].users && maps[key].users[socket.id]) {
          storeMapAction({'mapId': key}, 'connect');
          delete maps[key].users[socket.id];
          socketIO.sockets.emit(key + '-users', maps[key]);
        }
      }
    });
  });

  return server;
};
