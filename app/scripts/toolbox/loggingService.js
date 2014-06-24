'use strict';
/**
 * @memberof CollaborativeMap
 * @fileOverview Sends a WebSocket message to the server. Used for the user study logging in ordner to store actions.
 * @exports CollaborativeMap.LoggingService
 *
 * @requires Socket
 *
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap')
  .service('LoggingService', ['Socket',
    function(Socket) {

      return {

        /**
         * Sends a 'logging' WebSocket message to the server.
         * Used for logging user interactions with the GUI for the user study evaluation.
         * @param  {String} mapId the map id
         * @param  {String} action the performed action
         * @param  {String} user the logged in user
         */
        logging: function(mapId, action) {
          Socket.emit('logging', {
            'mapId': mapId,
            'action': action
          }, function(res) {
            console.log(res);
          });
        }



      };
    }
  ]);
