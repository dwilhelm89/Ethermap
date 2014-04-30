'use strict';

angular.module('CollaborativeMap')
  .controller('MainCtrl', ['$scope', '$rootScope', '$routeParams', 'TesterService',
    function($scope, $rootScope, $routeParams, TesterService) {

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

      TesterService.init($scope, undefined);

    }
  ]);
