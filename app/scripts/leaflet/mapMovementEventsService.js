'use strict';

/**
 * @memberof CollaborativeMap
 *
 * @fileOverview Listeners for mouse drage and scroll events to catch map movements.
 * Used instead of direct leaflet events to prevent back coupling problems.
 * Callbacks of all events are handled in the SynchronizeMapService.
 *
 * @exports CollaborativeMap.MapMovementEvents
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap')
  .service('MapMovementEvents', function() {
    return {

      /**
       * Connects the events
       * @param  {Object}   map      the map
       * @param  {Function} callback
       */
      connectMapEvents: function(map, callback) {
        // catches any map movements (drag, zoom, resize, ...)
        map.on('moveend', function(e) {
          var bounds = map.getBounds();
          callback({
            'nE': [bounds._northEast.lat, bounds._northEast.lng],
            'sW': [bounds._southWest.lat, bounds._southWest.lng]
          });
        });
      },


    };
  });
