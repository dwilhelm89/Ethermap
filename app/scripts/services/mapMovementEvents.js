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
  .service('SynchronizeMap', ['MapMovementEvents', 'Socket',
    function(MapMovementEvents, Socket) {


      function sendMapMovements(mapId, event) {
        var message = {
          'event': event,
          'mapId': mapId
        };

        Socket.emit('mapMovement', message, function(res) {
          console.log(res);
        });
      }

      function receiveMapMovements(mapId, map){
        Socket.on(mapId + '-mapMovement', function(res){
          if(res.event && res.event.center && res.event.zoom){
            map.setView(res.event.center, res.event.zoom);
          }
        });
      }


      return {

        enableSynchronization: function(map, mapId) {

          MapMovementEvents.connectMapEvents(map, function(event) {
            sendMapMovements(mapId, event);
          });

          receiveMapMovements(mapId, map);

        }

      };

    }
  ]);
