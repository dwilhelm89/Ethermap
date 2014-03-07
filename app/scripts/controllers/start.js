'use strict';

angular.module('CollaborativeMap')
  .controller('StartCtrl', ['$scope', '$location', 'Utils', function($scope, $location, Utils){
    
    $scope.startClick = function(){
      var mapId = $scope.mapIdInput || Utils.createId();
      $location.path('/map/' + mapId);
    };

  }]);
