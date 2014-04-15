'use strict';

angular.module('CollaborativeMap')
  .service('MapMovementEvents', function() {
    return {

      connectMapEvents: function(map, callback) {

        map.on('moveend', function(event) {
          var bounds = event.target.getBounds();
          callback({
            'nE': [bounds._northEast.lat,bounds._northEast.lng],
            'sW': [bounds._southWest.lat,bounds._southWest.lng]
          });
        });
        map.on('zoomend', function(event) {
          var bounds = event.target.getBounds();
          callback({
            'nE': [bounds._northEast.lat,bounds._northEast.lng],
            'sW': [bounds._southWest.lat,bounds._southWest.lng]
          });
        });
      }

    };
  });
