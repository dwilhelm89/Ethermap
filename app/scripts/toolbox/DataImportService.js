/**
 * @memberof CollaborativeMap
 * @fileOverview Data import directive.
 * Provides import functionality to the map.
 * Supported formats are currently: GeoJSON
 * @exports CollaborativeMap.DataImport
 *
 * @author Norwin Roosen
 */

'use strict';

angular.module('CollaborativeMap')
  .service('DataImport', ['MapHandler', 'Utils',
    function(MapHandler, Utils) {

      var map;

      return {
        init: function(mapInstance) {
          map = mapInstance;
        },

        /**
         * Create MapObjects from external geoJSON resources,
         * which are not from the draw toolbar nor database, and thus have no FID.
         * @param {Object} data The (valid) GeoJSON data
         */
        importGeoJson: function(data) {
          var geojson = MapHandler.createSimpleStyleGeoJSONFeature(data);

          // fake a draw event, so we can reuse the existing signaling pipeline:
          // (add to map, clickhandlers, broadcast to other users, ..)
          geojson.eachLayer(function(layer) {
            map.fire('draw:created', {
              action: 'imported feature',
              layer: layer
            });
          });

          map.fitBounds(geojson);
        }
      };

    }]
  );
