'use strict';

var express = require('express'),
  http = require('http');

/**
 * Main application file
 */

// Set default node environment to development
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Application Config
var config = require('./lib/config/config');

var app = express();

// Express settings
require('./lib/config/express')(app);

// Routing
require('./lib/routes')(app);




// Start the app by listening on <port>
var port = process.env.PORT || config.port;

var server = http.createServer(app);
var socketIO = require('socket.io').listen(server, {
  'log level': 3
});
socketIO.sockets.on('connection', function(socket) {
  console.log('connect to something');
  socket.on('disconnect', function() {
    console.log('bye bye');
  });
});

server.listen(port);
console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));

/*
// Start server
app.listen(config.port, function() {
  console.log('Express server listening on port %d in %s mode', config.port, app.get('env'));
});
*/


// Expose app
exports = module.exports = app;
