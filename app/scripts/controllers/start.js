'use strict';

angular.module('CollaborativeMap')
  .controller('StartCtrl', ['$scope', '$rootScope', '$location', 'Utils', function($scope, $rootScope, $location, Utils){
    
    function startMap(){
      //a+  as couchdb db names can't start with a number
      var mapId = $scope.mapIdInput || 'a' + Utils.createId();
      $rootScope.userName = $scope.userInput;
      $location.path('/map/' + mapId);
    }

    $scope.startClick = function(){
      startMap();
    };

    $scope.startWithKey = function(e){
      if(e.keyCode === 13){
        startMap();
      }
    };

  }]);
