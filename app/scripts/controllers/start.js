'use strict';

angular.module('CollaborativeMap')
  .controller('StartCtrl', ['$scope', '$rootScope', '$location', 'Utils', 'TesterService',
    function($scope, $rootScope, $location, Utils, TesterService) {

      function loadName() {
        var oldName = localStorage.getItem('cm-user');
        if (oldName && oldName !== 'undefined') {
          $scope.userInput = oldName;
        }
      }

      function saveName() {
        var name = $scope.userInput;
        if (name !== '') {
          localStorage.setItem('cm-user', name);
        }
      }

      loadName();

      function startMap() {
        //a+  as couchdb db names can't start with a number
        var mapId = $scope.mapIdInput || 'a' + Utils.createId();
        $rootScope.userName = $scope.userInput;
        saveName();
        $location.path('/map/' + mapId);
      }

      $scope.startClick = function() {
        startMap();
      };

      $scope.startWithKey = function(e) {
        if (e.keyCode === 13) {
          startMap();
        }
      };

      TesterService.init($scope, $location);
    }
  ]);
