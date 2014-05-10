'use strict';
/**
 * @memberof CollaborativeMap
 * @fileOverview Handles the WebSocket connection. Provides the method to connect to a stream as well to emit messages.
 * @exports CollaborativeMap.Socket
 * @author Dennis Wilhelm
 */
angular.module('SocketModule')
  .factory('Socket', ['$rootScope',
    function($rootScope) {
      var socket = io.connect();

      socket.on('connect', function() {
        $rootScope.$root.$broadcast('socketio-connected');
      });

      socket.on('disconnect', function() {
        $rootScope.$root.$broadcast('socketio-disconnected');
      });

      return {
        /**
         * Connect to a WebSocket stream
         * @param {String} eventName name of the stream
         * @param {Function} callback
         */
        on: function(eventName, callback) {
          socket.on(eventName, function() {
            var args = arguments;
            $rootScope.$apply(function() {
              callback.apply(socket, args);
            });
          });
        },

        /**
         * Emits/Sends a message to a WebSocket stream
         * @param {String} eventName name of the stream
         * @param {Object} data  the data to be send
         * @param {Function} callbak
         */
        emit: function(eventName, data, callback) {
          socket.emit(eventName, data, function() {
            var args = arguments;
            $rootScope.$apply(function() {
              if (callback) {
                callback.apply(socket, args);
              }
            });
          });
        }
      };

    }
  ]);
