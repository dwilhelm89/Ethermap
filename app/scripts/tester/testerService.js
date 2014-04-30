'use strict';

angular.module('CollaborativeMap').
factory('TesterService', ['Socket',
  function(Socket) {


    return {
      scope: undefined,
      location: undefined,

      init: function(mapScope, loc) {
        this.scope = mapScope;
        this.location = loc;
        this.connectWebsocket();
      },

      connectWebsocket: function() {
        Socket.on('tester-commands', function(data) {
          this.handleCommands(data);
        }.bind(this));
      },

      handleCommands: function(e) {
        if (e && e.command) {
          var command = e.command;
          if (command === 'loadMap') {
            this.goToMap();
          } else if (command === 'watchAll') {
            this.watchAll();
          }
        }
        if (e && e.evalMessage) {
          eval(e.evalMessage);
        }
      },

      goToMap: function() {
        this.location.path('/map/tester');
      },

      watchAll: function() {
        this.scope.isWatchingAll = true;
      }

    };
  }
]);
