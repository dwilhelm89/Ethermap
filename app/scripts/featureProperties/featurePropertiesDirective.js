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

            //TODO: filter simplestyle spec items: https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0

            //jshint camelcase:false
            activateToolbox();

            $scope.selectedFeature = {
              'properties': [],
              'fid': feature._leaflet_id
            };

            var tmpGeoJSON =  $scope.selectedFeature.feature = feature.toGeoJSON();

            for (var prop in tmpGeoJSON.properties) {
              $scope.selectedFeature.properties.push({
                'key': prop,
                'value': tmpGeoJSON.properties[prop]
              });
            }

            $scope.$apply();
          };

          function updateFeature() {
            $scope.selectedFeature.properties.forEach(function(prop){
              $scope.selectedFeature.feature.properties[prop.key] = prop.value;
            });
            MapHandler.updateFeature($scope.selectedFeature);
          }

          $scope.newProperty = function() {
            if ($scope.newKey && $scope.newValue) {
              $scope.selectedFeature.properties.push({
                'key': $scope.newKey,
                'value': $scope.newValue
              });
              $scope.newKey = '';
              $scope.newValue = '';
              updateFeature();
            }
          };

          $scope.savePropertyChanges = function() {
            updateFeature();
          };

        }
      };
    }
  ]);
