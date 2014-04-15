'use strict';

angular.module('CollaborativeMap')
  .service('MapDrawEvents', function() {

    var mapScope;

    function eventToMessage(event, type) {
      //jshint camelcase: false
      return {
        'action': type,
        'feature': event.layer.toGeoJSON(),
        'fid': event.layer._leaflet_id,
        'user': mapScope.userName
      };
    }

    return {

      connectMapEvents: function(map, scope, callback) {
        mapScope = scope;

        map.on('draw:created', function(event) {
          callback(eventToMessage(event, 'created'));
        });

        map.on('draw:edited', function(event) {
          if (event.layers && event.layers._layers) {
            var layers = event.layers._layers;

            for (var key in layers) {
              callback(eventToMessage({
                layer: layers[key]
              }, 'edited'));
            }
          }
        });

        map.on('draw:deleted', function(event) {
          if (event.layers && event.layers._layers) {
            var layers = event.layers._layers;

            for (var key in layers) {
              callback(eventToMessage({
                layer: layers[key]
              }, 'deleted'));
            }
          }
        });
      }

    };
  });