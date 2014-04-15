'use strict';

var couchdbHandler = require('./couchdbHandler.js'),
  index = require('./controllers');

/**
 * Application routes
 */
module.exports = function(app) {

  // Server API Routes
  app.get('/api/history/:mapId', function(req, res) {
    if (req.params.mapId) {
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
    }
  });

  app.get('/api/features/:mapId', function(req, res) {
    if (req.params.mapId) {
      couchdbHandler.getFeatures(req.params.mapId, function(err, features) {
        if (err) {
          res.writeHead(500, {
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify(err));
        } else {
          res.writeHead(200, {
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify(features));
        }
      });
    }
  });

  app.get('/api/history/revertFeature/:mapId/:fid/:toRev', function(req, res){
    if(req.params.mapId && req.params.fid && req.params.toRev){
      couchdbHandler.revertFeature(req.params.mapId, req.params.fid, req.params.toRev, function(err, features) {
        if (err) {
          res.writeHead(500, {
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify(err));
        } else {
          res.writeHead(200, {
            'Content-Type': 'application/json'
          });
          res.end(JSON.stringify(features));
        }
      });
    }
  });

  // All undefined api routes should return a 404
  app.get('/api/*', function(req, res) {
    res.send(404);
  });

  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);
  app.get('/*', index.index);
};
