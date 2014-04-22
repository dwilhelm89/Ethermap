'use strict';

angular.module('CollaborativeMap')
  .service('MapMovementEvents', function() {
    return {

      connectMapEvents: function(map, callback) {

        var element = map._container;

        this.addDragEvent(map, element, callback);
        this.addScrollEvent(map, element, callback);

      },

      addDragEvent: function(map, element, callback) {
        var flag = 0;

        element.addEventListener('mousedown', function() {
          flag = 0;
        }, false);
        element.addEventListener('mousemove', function() {
          flag = 1;
        }, false);
        element.addEventListener('mouseup', function() {
          if (flag === 0) {
            //click
          } else if (flag === 1) {
            //If a drag has been performed, upload the new map-position
            callback(this.getBoundsMessage(map));
          }
        }.bind(this), false);
      },

      addScrollEvent: function(map, element, callback) {
        element.addEventListener('mousewheel', function() {
          callback(this.getBoundsMessage(map));
        }.bind(this), false);

      },

      getBoundsMessage: function(map) {
        var bounds = map.getBounds();
        return {
          'nE': [bounds._northEast.lat, bounds._northEast.lng],
          'sW': [bounds._southWest.lat, bounds._southWest.lng]
        };
      }

    };
  });
