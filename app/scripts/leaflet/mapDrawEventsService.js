'use strict';

angular.module('CollaborativeMap')
  .service('MapDrawEvents', ['MapHandler',
    function(MapHandler) {

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
            scope.selectFeature(event.layer);
            MapHandler.addClickEvent(event.layer);
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

          map.on('propertyEdited', function(event) {
            if (event && event.layer && event.fid) {
              callback({
                'action': 'edited',
                'feature': event.layer,
                'fid': event.fid,
                user: mapScope.userName
              });
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
    }
  ]);
