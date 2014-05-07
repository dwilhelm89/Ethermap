'use strict';

/**
 * @memberof CollaborativeMap
 * @fileOverview Tester controller. GUI to send the WebSocket commands for the TesterService. Used to make testing on several computers easier.
 * @exports CollaborativeMap.TesterCtrl
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap')
  .controller('TesterCtrl', ['$http', '$scope', 'Socket',
    function($http, $scope, Socket) {

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
        sendRandomPoints($scope.numberOfMarkerFeatures, $scope.randomMarkerFeatureDelay);
      };

      function sendRandomPoints(number, delay) {

        var i = 0;
        for (i; i < number; i++) {

          (function() {
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

      $scope.createRandomBuildings = function() {
        sendMuensterBuildings($scope.numberOfBuildingFeatures, $scope.randomFeatureBuildingDelay);
      };

      function sendMuensterBuildings(number, delay) {
        console.log(delay);
        var i = 0;
        for (i; i < number; i++) {
          (function() {
            setTimeout(function() {
              $http({
                method: 'GET',
                url: 'http://giv-wilhelm.uni-muenster.de:9090'
              })
                .
              success(function(data) { //, status, headers, config) {
                Socket.emit('mapDraw', {
                  mapId: 'tester',
                  'event': {
                    'feature': data,
                    'user': 'testerBot',
                    'action': 'created'
                  }
                });
              })
                .
              error(function(data) { //, status, headers, config) {
                console.log(data);
              });
            }, delay * i);

          })();
        }
      }

      $scope.createMapMovementEvents = function() {
        console.log('send movements');
        sendMovementEvents($scope.numberOfMovements, $scope.movementDelay);

      };

      function sendMovementEvents(number, delay) {
        var i = 0;
        for (i; i < number; i++) {

          (function() {
            setTimeout(function() {

              Socket.emit('mapMovement', {
                mapId: 'tester',
                'event': {
                  'nE': [randomNumberFromInterval(51, 52),randomNumberFromInterval(7, 9)],
                  'sW': [randomNumberFromInterval(51, 52),randomNumberFromInterval(7, 9)]
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
