'use strict';

angular.module('CollaborativeMap')
  .controller('MainCtrl', ['$scope', '$rootScope', '$routeParams', 'SynchronizeMap', 'Utils',
    function($scope, $rootScope, $routeParams, SynchronizeMap, Utils) {

      $scope.userName = $rootScope.userName = $rootScope.userName || 'unnamed';

      //TODO: random map id generator
      $scope.mapId = $routeParams.mapid;

      //patch L.stamp to get unique layer ids
      Utils.patchLStamp();

      $scope.onMapReady = function() {
        SynchronizeMap.init($scope.map, $scope, $scope.drawnItems);
      };

    }
  ]);
