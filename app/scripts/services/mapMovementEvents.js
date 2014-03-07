'use strict';

angular.module('CollaborativeMap')
  .service('MapMovementEvents', function() {
    return {

      connectMapEvents: function(map, callback) {

        map.on('moveend', function(event) {
          callback({
            'center': event.target.getCenter(),
            'zoom': event.target.getZoom()
          });
        });
        map.on('zoomend', function(event) {
          callback({
            'center': event.target.getCenter(),
            'zoom': event.target.getZoom()
          });
        });
      }

    };
  });

angular.module('CollaborativeMap')
  .service('MapDrawEvents', function() {

    function eventToMessage(event, type) {
      //jshint camelcase: false
      return {
        'action': type,
        'feature': event.layer.toGeoJSON(),
        'fid': event.layer._leaflet_id
      };
    }

    return {

      connectMapEvents: function(map, callback) {

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


angular.module('CollaborativeMap')
  .service('SynchronizeMap', ['MapMovementEvents', 'MapDrawEvents', 'Socket',
    function(MapMovementEvents, MapDrawEvents, Socket) {


      function sendMapMovements(mapId, event) {
        var message = {
          'event': event,
          'mapId': mapId
        };

        Socket.emit('mapMovement', message, function(res) {
          console.log(res);
        });
      }

      function receiveMapMovements(mapId, map) {
        Socket.on(mapId + '-mapMovement', function(res) {
          if (res.event && res.event.center && res.event.zoom) {
            map.setView(res.event.center, res.event.zoom);
          }
        });
      }

      function sendMapDraws(mapId, event) {
        var message = {
          'event': event,
          'mapId': mapId
        };

        Socket.emit('mapDraw', message, function(res) {
          console.log(res);
        });

      }

      function addGeoJSONFeature(map, event, drawnItems) {
        //jshint camelcase:false
        var newLayer = L.geoJson(event.feature);
        var tmpLayer;
        for (var key in newLayer._layers) {
          tmpLayer = newLayer._layers[key];
          tmpLayer._leaflet_id = event.fid;
          tmpLayer.addTo(drawnItems);
        }
      }

      function removeLayer(map, event, drawnItems) {
        var deleteLayer = map._layers[event.fid];
        if (deleteLayer) {
          map.removeLayer(deleteLayer);
          drawnItems.removeLayer(deleteLayer);
        }
      }

      function receiveMapDraws(mapId, map, drawnItems) {
        //jshint camelcase:false
        Socket.on(mapId + '-mapDraw', function(res) {
          if (res && res.event) {
            var event = res.event;

            if (event.action === 'created') {
              addGeoJSONFeature(map, event, drawnItems);
            } else if (event.action === 'edited') {
              removeLayer(map, event, drawnItems);
              addGeoJSONFeature(map, event, drawnItems);
            } else if (event.action === 'deleted') {
              removeLayer(map, event, drawnItems);
            }

          }
        });
      }


      return {

        enableMovementSynchronization: function(map, mapId) {

          MapMovementEvents.connectMapEvents(map, function(event) {
            sendMapMovements(mapId, event);
          });

          receiveMapMovements(mapId, map);

        },

        enableDrawSynchronization: function(map, mapId, drawnItems) {

          MapDrawEvents.connectMapEvents(map, function(event) {
            sendMapDraws(mapId, event);
            console.log(event);
          });

          receiveMapDraws(mapId, map, drawnItems);

        }

      };

    }
  ]);
