'use strict';

angular.module('CollaborativeMap')
  .directive('featureproperties', ['$compile', 'MapHandler',
    function($compile, MapHandler) {




      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'partials/featureproperties',
        replace: true,
        link: function postLink($scope) {

          function activateToolbox() {
            if ($scope.views.toolBarIn) {
              $scope.toggleToolbar('toolsView');
              $scope.$apply();
            } else if ($scope.views.toolsView) {
              $scope.toggleToolbar('toolsView');
              $scope.$apply();
            }

          }

          //called from the feature onClick through the map services
          $scope.selectFeature = function(feature) {
            //jshint camelcase:false
            activateToolbox();
            $scope.selectedFeature = {
              'feature': feature.toGeoJSON(),
              'fid': feature._leaflet_id
            };
            $scope.selectedFeature.feature.properties.time = new Date().getTime();
            $scope.$apply();
          };

          function updateFeature() {
            MapHandler.updateFeature($scope.selectedFeature);
          }

          $scope.newProperty = function() {
            if ($scope.newKey && $scope.newValue) {
              $scope.selectedFeature.feature.properties[$scope.newKey] = $scope.newValue;
              $scope.newKey = '';
              $scope.newValue = '';
              updateFeature();
            }
          };

        }
      };
    }
  ]);
