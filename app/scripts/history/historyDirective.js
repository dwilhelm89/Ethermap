'use strict';

angular.module('CollaborativeMap')
  .directive('history', ['$http', 'MapHandler',
    function($http, MapHandler) {

      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'partials/history',
        replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function($scope) { //, iElm, iAttrs, controller) {
          var visible = false;


          function loadHistory(fid) {
            $http({
              method: 'GET',
              url: '/api/documentRevisions/' + $scope.mapId + '/' + fid
            })
              .
            success(function(data) { //, status, headers, config) {
              console.log(data);
              $scope.documentRevision = data;

            })
              .
            error(function(data) { //, status, headers, config) {
              console.log(data);
            });

          }

          $scope.revertFeature = function(id, rev) {
            MapHandler.revertFeature($scope.mapId, id, rev, $scope.userName);
          };

          $scope.toggleHistoryModal = function(fid) {
            visible = !visible;
            $('#historyModal').modal('toggle');
            if (visible) {
              loadHistory(fid);
            }
          };
        }
      };
    }
  ]);
