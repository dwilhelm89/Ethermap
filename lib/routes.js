'use strict';

/**
 * @fileOverview Handles the express routing
 * @author Dennis Wilhelm
 */

var dbHandler = require('./dbHandler.js'),
  index = require('./controllers'),
  fs = require('fs');

/**
 * Routes for the API and the Angular app
 * @param  {Object} app the express app
 */
module.exports = function(app) {


  // Server API Routes
  app.get('/api/history/:mapId', function(req, res) {
    if (req.params.mapId) {
      dbHandler.getActions(req.params.mapId, function(err, res2) {

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

  /**
   * App route to the map features.
   * Calls the dbHandler to get all features of a specific map and returns them as JSON
   */
  app.get('/api/features/:mapId', function(req, res) {
    if (req.params.mapId) {
      //provide res as a writeStream for the database query
      dbHandler.getFeaturesStream(req.params.mapId, res);
    }
  });

  /**
   * App route to the feature revisions.
   * Calls the dbHandler to get all revisions of a feature of a specific map and returns them as JSON
   */
  app.get('/api/documentRevisions/:mapId/:docId', function(req, res) {
    if (req.params.mapId && req.params.docId) {
      dbHandler.getDocumentRevisions(req.params.mapId, req.params.docId, function(err, res2) {

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

  /**
   * Provides a JSON response containing OSM categories.
   * Categories are the overall class a feature in OSM can have.
   */
  app.get('/presets/categories', function(req, res) {
    fs
      .createReadStream(__dirname + '/presets/categories.json')
      .pipe(res);
  });

  /**
   * Provides a JSON response containing OSM fields.
   * Fields provide information about the different attributes
   * assigned to the preset.
   */
  app.get('/presets/fields', function(req, res) {
    fs
      .createReadStream(__dirname + '/presets/fields.json')
      .pipe(res);
  });

  /**
   * Provides a JSON response containing OSM presets.
   * Presets are subcategories showing with an array
   * to assign field types to the preset.
   */
  app.get('/presets/presets', function(req, res) {
    fs
      .createReadStream(__dirname + '/presets/presets.json')
      .pipe(res);
  });


  /**
   * All undefined api routes should return a 404
   */
  app.get('/api/*', function(req, res) {
    res.send(404);
  });

  /**
   * All other routes to use Angular routing in app/scripts/app.js
   */
  app.get('/partials/*', index.partials);

  /**
   * Everything else routes to index
   */
  app.get('/*', index.index);
};
