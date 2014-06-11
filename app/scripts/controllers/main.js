'use strict';

/**
 * @memberof CollaborativeMap
 * @fileOverview Main controller of the app. 
 * Initializes the TesterService (remove before using in production!)
 * @exports CollaborativeMap.MainCtrl
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap')
  .controller('MainCtrl', ['$scope', '$rootScope', '$routeParams',
    function($scope, $rootScope, $routeParams) {

      function loadName() {
        var oldName = localStorage.getItem('cm-user');
        if (oldName && oldName !== 'undefined') {
          $rootScope.userName = oldName;
        }
        $scope.userName = $rootScope.userName = $rootScope.userName || 'unnamed';
      }

      loadName();
      //TODO: random map id generator
      $scope.$root.mapId = $scope.mapId = $routeParams.mapid.toLowerCase();

      // TesterService.init($scope, undefined);

    }
  ]);
