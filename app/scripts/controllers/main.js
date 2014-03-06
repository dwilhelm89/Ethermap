'use strict';

angular.module('CollaborativeMap')
  .controller('MainCtrl', ['$scope','$routeParams', 'SynchronizeMap', function($scope,$routeParams, SynchronizeMap) {
    
    //TODO: random map id generator
    $scope.mapId = $routeParams.mapid || 'randomMapId';

    var map = L.mapbox.map('map', 'dnns.h8dkb1bh');

    SynchronizeMap.enableSynchronization(map, $scope.mapId);

  }]);
