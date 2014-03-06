'use strict';

angular.module('CollaborativeMap')
  .controller('StartCtrl', ['$scope', '$location', function($scope, $location){
    
    $scope.startClick = function(){
      $location.path('/map/' + $scope.mapIdInput);
    };

  }]);
