'use strict';

angular.module('CollaborativeMap')
  .controller('MainCtrl', ['$scope', '$rootScope', '$routeParams', 'SynchronizeMap', 'Utils',
    function($scope, $rootScope, $routeParams, SynchronizeMap, Utils) {

      function loadName() {
        var oldName = localStorage.getItem('cm-user');
        if (oldName && oldName !== 'undefined') {
          $rootScope.userName = oldName;
        }
        $scope.userName = $rootScope.userName = $rootScope.userName || 'unnamed';
      }

      loadName();

      //TODO: random map id generator
      $scope.mapId = $routeParams.mapid.toLowerCase();

      //patch L.stamp to get unique layer ids
      Utils.patchLStamp();

      $scope.onMapReady = function() {
        SynchronizeMap.init($scope.map, $scope, $scope.drawnItems);
      };

    }
  ]);
