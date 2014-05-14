'use strict';
/**
 * @memberof CollaborativeMap
 * @fileOverview Handles the WebSocket connection for the map synchronization (map movements, draw events)
 * @exports CollaborativeMap.SynchronizeMap
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap')
  .service('SynchronizeMap', ['MapMovementEvents', 'MapDrawEvents', 'Socket', 'MapHandler',
    function(MapMovementEvents, MapDrawEvents, Socket, MapHandler) {


      var mapScope;


      /**
       * Sends a Websocket event containing movement information
       * @param  {String} mapId
       * @param  {Object} event = {sE, nW}
       */

      function sendMapMovements(mapId, event) {
        var message = {
          'event': event,
          'mapId': mapId
        };

        Socket.emit('mapMovement', message, function(res) {
          console.log(res);
        });
      }


      /**
       * Checks if the user is setting as watched or if all users are being watched
       * @param  {String}  userId
       * @return {Boolean}
       */

      function isWachtingUser(userId) {
        var res = mapScope.isWatchingAll || mapScope.watchUsers[userId] || false;
        return res;
      }


      /**
       * Stores the mapBounds of a user. If the user is being watched, update the current map bounds
       * @param  {Object} movement = {event: {nE, sW, userId}}
       * @param  {Object} map
       */

      function handleMapMovements(movement) {
        if (movement.event && movement.event.nE && movement.event.sW && movement.event.userId) {
          var newBounds = MapHandler.getBounds(movement.event.nE, movement.event.sW);
          mapScope.userBounds[movement.event.userId] = newBounds;
          if (isWachtingUser(movement.event.userId)) {
            MapHandler.fitBounds(newBounds);
          }
        }
      }


      /**
       * Connects to the Websocket mapMovement channel
       * @param  {String} mapId
       * @param  {Object} map
       */

      function receiveMapMovements(mapId) {
        Socket.on(mapId + '-mapMovement', function(res) {
          handleMapMovements(res);
        });
      }


      /**
       * Sends the current map position via WebSockets
       * @param  {String} mapId
       * @param  {Object} event = {action //edited/deleted/created, feature //Leaflet feature, fid //feature id, user}
       */

      function sendMapDraws(mapId, event) {
        var message = {
          'event': event,
          'mapId': mapId
        };

        Socket.emit('mapDraw', message, function(res) {
          console.log(res);
        });

      }


      /**
       * Adds an action element to the toolbox history view
       * @param  {Object} event = {fid, user, feature}
       */

      function updateHistoryView(event) {
        var updateEvent = {
          id: event.fid,
          user: event.user,
          rev: event.feature._rev,
          action: 'edited',
          date: new Date().getTime()
        };
        mapScope.$root.$broadcast('appendToHistory', updateEvent);
      }


      /**
       * Select/ Reselect a feature
       * @param  {Object} map
       * @param  {Object} event = mapDraw event
       */

      function updateToolsView(map, event) {
        //without a timeout, the autobinding of angular doesn't seem to work
        setTimeout(function() {
          mapScope.selectFeature(map._layers[event.fid]);
        }, 50);
      }


      /**
       * Checks if a toolbox windows is currently opened and initializes view updates
       * @param  {Object} map
       * @param  {Object} event = mapDraw event
       */

      function refreshToolbox(map, event) {
        var views = mapScope.views;
        if (!views.historyView) {
          updateHistoryView(event);
        } else if (!views.toolsView) {
          if (mapScope.selectedFeature.fid === event.fid) {
            updateToolsView(map, event);
          }
        }
      }


      /**
       * Connects to the mapDraw Websockets. 
       * Initializes a toobox refresh
       * Checks for the action type (created, edited, deleted) and adds/updates/deletes a layer.
       * @param  {String} mapId
       * @param  {Object} map
       * @param  {Object} drawnItems = layer group on which the features are drawn
       */
      function receiveMapDraws(mapId, map, drawnItems) {

        Socket.on(mapId + '-mapDraw', function(res) {
          if (res && res.event) {
            refreshToolbox(map, res.event);

            var event = res.event;

            if (event.action === 'created' ||event.action === 'created feature') {

              MapHandler.addGeoJSONFeature(map, event, drawnItems);

            } else if (event.action === 'edited' || event.action === 'edited geometry' || event.action === 'edited properties') {

              MapHandler.removeLayer(map, event, drawnItems);
              MapHandler.addGeoJSONFeature(map, event, drawnItems);

            } else if (event.action === 'deleted' || event.action === 'deleted feature') {

              MapHandler.removeLayer(map, event, drawnItems);

            }

          }
        });
      }

      /**
       * Connects to the users WebSockets and updates the users in scope
       * @param  {String} mapId
       */
      function receiveUsers(mapId) {
        Socket.on(mapId + '-users', function(res) {
          mapScope.users = res.users;
        });
      }

      /**
       * Sends the user name to the Server via Websockets
       * @param  {String} mapId
       * @param  {String} userName
       */
      function login(mapId, userName) {
        Socket.emit('login', {
          'mapId': mapId,
          'user': userName
        });
      }


      return {

        /**
         * Initializes the map synchronization:
         * Connects to all WebSocket events:
         * -mapDraw, -mapMovements, -users 
         * @param  {Object} map
         * @param  {Object} scope Angular scope
         * @param  {Object} drawnItems layer group for drawn features
         */
        init: function(map, scope, drawnItems) {
          mapScope = scope;
          login(mapScope.mapId, mapScope.userName);

          MapMovementEvents.connectMapEvents(map, function(event) {
            sendMapMovements(scope.mapId, event);
          });

          receiveMapMovements(scope.mapId);
          receiveUsers(scope.mapId);

          MapDrawEvents.connectMapEvents(map, scope, function(event) {
            sendMapDraws(scope.mapId, event);
          });

          receiveMapDraws(scope.mapId, map, drawnItems);
        }



      };

    }
  ]);
