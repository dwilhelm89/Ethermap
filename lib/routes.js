'use strict';

var couchdbHandler = require('./couchdbHandler.js'),
  index = require('./controllers');

/**
 * Application routes
 */
module.exports = function(app) {

  // Server API Routes
  app.get('/api/actions/:mapId', function(req, res) {
    couchdbHandler.getActions(req.params.mapId, function(err, res2) {

      if (err) {
        res.writeHead(500, {
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify(err));
      } else {
        res.writeHead(200, {
          'Content-Type': 'application/json'
        });
        res.end(JSON.stringify(res2));
      }
    });
  });


  // All undefined api routes should return a 404
  app.get('/api/*', function(req, res) {
    res.send(404);
  });

  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);
  app.get('/*', index.index);
};
