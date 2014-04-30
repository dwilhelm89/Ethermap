'use strict';

angular.module('CollaborativeMap')
  .controller('TesterCtrl', ['$scope','Socket',
    function($scope, Socket) {

      $scope.evalJS = function() {
        Socket.emit('tester', {evalMessage: $scope.evalInput});
      };

      $scope.loadMap = function(){
        Socket.emit('tester', {command: 'loadMap'});
      };

      $scope.watchAll = function(){
        Socket.emit('tester', {command: 'watchAll'});
      };

    }
  ]);
