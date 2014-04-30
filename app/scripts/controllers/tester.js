'use strict';

angular.module('CollaborativeMap')
  .controller('TesterCtrl', ['$scope', 'Socket',
    function($scope, Socket) {

      $scope.evalJS = function() {
        Socket.emit('tester', {
          evalMessage: $scope.evalInput
        });
      };

      $scope.loadMap = function() {
        Socket.emit('tester', {
          command: 'loadMap'
        });
      };

      $scope.watchAll = function() {
        Socket.emit('tester', {
          command: 'watchAll'
        });
      };

      $scope.createRandomFeatures = function() {
        console.log("send random features");
        sendRandomPoints($scope.numberOfFeatures, $scope.randomFeatureDelay);
      };

      function sendRandomPoints(number, delay) {
        var featureDelay = delay;
        if(!featureDelay) {
          featureDelay = 1000;
        }

        var i = 0;
        for (i; i < number; i++) {

          (function(f) {
            setTimeout(function() {
              var feature = {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [],
                },
                properties: {}
              };
              feature.geometry.coordinates[1] = randomNumberFromInterval(51, 52);
              feature.geometry.coordinates[0] = randomNumberFromInterval(7, 9);
              console.log(feature);
              Socket.emit('mapDraw', {
                mapId: 'tester',
                'event': {
                  'feature': feature,
                  'user': 'testerBot',
                  'action': 'created'
                }
              });
            }, delay * i);
          })();

        }
      }

      function randomNumberFromInterval(min, max) {
        return Math.random() * (max - min + 1) + min;
      }

    }
  ]);
