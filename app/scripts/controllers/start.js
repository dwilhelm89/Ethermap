'use strict';

angular.module('CollaborativeMap')
  .controller('StartCtrl', ['$scope', '$rootScope', '$location', 'Utils', function($scope, $rootScope, $location, Utils){
    
    $scope.startClick = function(){
      var mapId = $scope.mapIdInput || Utils.createId();
      $rootScope.userName = $scope.userInput;
      $location.path('/map/' + mapId);
    };

  }]);
