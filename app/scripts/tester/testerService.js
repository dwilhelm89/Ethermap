'use strict';

/**
 * @memberof CollaborativeMap
 * @fileOverview Tester factory which connects to a WebSocket Stream.
 * Helps testing the software on multiple computers by loading the correct map on all machines, toogles the watchAll variable.
 * Should be removed before used in production!
 * @exports CollaborativeMap.TesterService
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap').
factory('TesterService', ['Socket',
  function(Socket) {




    return {
      scope: undefined,
      location: undefined,

      /**
       * Initializes the testerService by setting the local variables and connecting to the WebSocket stream
       * @param {Object} mapScope Angular $Scope
       * @param {Object} loc      Angular $location
       */
      init: function(mapScope, loc) {
        this.scope = mapScope;
        this.location = loc;
        this.connectWebsocket();
      },

      /**
       * Connecting to the Websocket 'tester-commands' Stream
       */
      connectWebsocket: function() {
        Socket.on('tester-commands', function(data) {
          this.handleCommands(data);
        }.bind(this));
      },

      /**
       * Handles the WebSocket results. Performs the different helper methods based on the stream data
       * eval = evil
       * @param {Object} e  the Websocket message
       */
      handleCommands: function(e) {
        if (e && e.command) {
          var command = e.command;
          if (command === 'loadMap') {
            this.goToMap();
          } else if (command === 'watchAll') {
            this.watchAll();
          } else if (command === 'randomName') {
            this.randomName();
          }
        }
        if (e && e.evalMessage) {
          eval(e.evalMessage);
        }
      },

      /**
       * Go to the map 'tester' and init a user name
       */
      goToMap: function() {
        var tmpName = Math.random();
        this.scope.userInput = tmpName;
        this.scope.mapIdInput = 'tester';
        this.scope.startClick();
      },

      /**
       * Toggles the isWatchingAll parameter. Used set multiple computers to watch via remote
       */
      watchAll: function() {
        this.scope.isWatchingAll = !this.scope.isWatchingAll;
      },

      /**
       * Creates a random user name and sets it to the scope variable
       */
      randomName: function(){
        this.scope.userName = Math.random() + '';
      }

    };
  }
]);
