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

        var element = map._container;

        this.addDragEvent(map, element, callback);
        this.addScrollEvent(map, element, callback);

      },

      /**
       * Adds the mouse listeners. If drag is catched, get the map bounds and fire the callback
       * @param {Object}   map      the map
       * @param {Object}   element  html element
       * @param {Function} callback
       */
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

      /**
       * Adds the scroll listeners. If scroll is catched, get the map bounds and fire the callback
       * @param {Object}   map      the map
       * @param {Object}   element  html element
       * @param {Function} callback 
       */
      addScrollEvent: function(map, element, callback) {
        element.addEventListener('mousewheel', function() {
          callback(this.getBoundsMessage(map));
        }.bind(this), false);

        element.addEventListener('DOMMouseScroll', function() {
          callback(this.getBoundsMessage(map));
        }.bind(this), false);

      },

      /**
       * Get the current bounding box of the map
       * @param  {Object} map the map
       * @return {Object}     bounding box {nE, sW}
       */
      getBoundsMessage: function(map) {
        var bounds = map.getBounds();
        return {
          'nE': [bounds._northEast.lat, bounds._northEast.lng],
          'sW': [bounds._southWest.lat, bounds._southWest.lng]
        };
      }

    };
  });
