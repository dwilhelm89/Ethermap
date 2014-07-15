'use strict';

/**
 * @memberof CollaborativeMap
 * @fileOverview Tester controller. GUI to send the WebSocket commands for the TesterService. Used to make testing on several computers easier.
 * @exports CollaborativeMap.TesterCtrl
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap')
  .controller('TesterCtrl', ['$http', '$scope', 'Socket', 'Utils',
    function($http, $scope, Socket, Utils) {

      $scope.destinationMap = 'tester';

      $scope.loadMap = function() {
        Socket.emit('tester', {
          command: 'loadMap',
          map: $scope.destinationMap
        });
      };

      $scope.watchAll = function() {
        Socket.emit('tester', {
          command: 'watchAll'
        });
      };

      $scope.setRandomName = function() {
        Socket.emit('tester', {
          command: 'randomName'
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
              feature.geometry.coordinates[1] = randomNumberFromInterval(51.9, 52);
              feature.geometry.coordinates[0] = randomNumberFromInterval(7.5, 7.7);
              Socket.emit('mapDraw', {
                mapId: $scope.destinationMap,
                'event': {
                  'feature': feature,
                  'user': 'testerBot',
                  'action': 'created feature',
                  'fid': Utils.createId()
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
                  mapId: $scope.destinationMap,
                  'event': {
                    'feature': data,
                    'user': 'testerBot',
                    'action': 'created feature',
                    'fid': Utils.createId()
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
        sendMovementEvents($scope.numberOfMovements, $scope.movementDelay);

      };


      function sendMovementEvents(number, delay) {
        var i = 0;
        for (i; i < number; i++) {

          (function() {
            setTimeout(function() {

              Socket.emit('mapMovement', {
                mapId: $scope.destinationMap,
                'event': {
                  'nE': [randomNumberFromInterval(51.9, 52), randomNumberFromInterval(7.5, 7.7)],
                  'sW': [randomNumberFromInterval(51.9, 52), randomNumberFromInterval(7.5, 7.7)]
                }
              });
            }, delay * i);
          })();

        }
      }

      function randomNumberFromInterval(min, max) {
        max = max - 1;
        return Math.random() * (max - min + 1) + min;
      }


      $scope.playbackFromDb = function() {
        var dbName = $scope.playbackDatabase;
        if (dbName) {
          $http({
            method: 'GET',
            url: 'api/features/' + dbName
          })
            .
          success(function(data) { //, status, headers, config) {
            if (data && data.rows) {
              playBack(data.rows);
            }
          })
            .
          error(function(data) { //, status, headers, config) {
            console.log(data);
          });
        }
      };

      function playBack(data) {
        var delay = $scope.playbackDelay || 1000;
        console.log(new Date().getTime());
        data.forEach(function(elem, i) {
          (function() {
            setTimeout(function() {
              if (elem.doc && elem.doc.action && elem.doc.event) {
                console.log(new Date().getTime());
                if (elem.doc.action === 'move') {
                  sendMovement(elem.doc);
                }else if(elem.doc.action === 'draw'){
                  sendDraw(elem.doc);
                }
              }
            }, delay * i);
          })();

        });
      }


      function sendMovement(event) {
        Socket.emit('mapMovement', {
          mapId: $scope.destinationMap,
          'event': event.event
        });
      }

      function sendDraw(event){
        Socket.emit('mapDraw',{
          mapId: $scope.destinationMap,
          'event': event.event
        });
      }

    }
  ]);
