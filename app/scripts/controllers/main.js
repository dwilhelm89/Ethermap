'use strict';

angular.module('CollaborativeMap')
  .controller('MainCtrl', ['$scope','$routeParams', 'Socket', function($scope,$routeParams, $Socket) {
    console.log($routeParams.mapid);
    console.log($scope);
    console.log($Socket);

  }]);
