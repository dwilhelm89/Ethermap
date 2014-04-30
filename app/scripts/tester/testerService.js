'use strict';

angular.module('CollaborativeMap').
factory('TesterService', ['Socket',
  function(Socket) {


    function sendRandomPoints(number) {
      var feature = {
        type: 'Feature',
        geometry: {
          coordinates: [],
        },
        properties: {}
      };

      var i = 0;
      for (i; i < number; i++) {
        feature.geometry.coordinates[0] = randomNumberFromInterval(51, 52);
        feature.geometry.coordinates[0] = randomNumberFromInterval(7, 9);
        
        setTimeout(function(){
          Socket.emit('mapDraw', {mapId: 'tester', event:{'feature': feature, user: 'testerBot'}})
        }, 1000);
      }
    }

    function randomNumberFromInterval(min, max) {
      return Math.random() * (max - min + 1) + min;
    }

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
