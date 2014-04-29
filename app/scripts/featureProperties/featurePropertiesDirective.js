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

            var tmpGeoJSON = $scope.selectedFeature.feature = feature.toGeoJSON();

            for (var prop in tmpGeoJSON.properties) {
              $scope.selectedFeature.properties.push({
                'key': prop,
                'value': tmpGeoJSON.properties[prop]
              });
            }
            
            if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
              $scope.$apply();
            }

          };

          function updateFeature() {
            $scope.selectedFeature.properties.forEach(function(prop) {
              $scope.selectedFeature.feature.properties[prop.key] = prop.value;
            });
            MapHandler.updateFeature($scope.selectedFeature);
          }

          $scope.newProperty = function(key) {
            var newProp = function() {
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

            if (key && key.keyCode === 13) {
              newProp();
            } else if (!key) {
              newProp();
            }
          };

          $scope.savePropertyChanges = function() {
            updateFeature();
          };

          $scope.hideNewProperty = true;
          $scope.addNewProperty = function(e) {
            var element = e.currentTarget;
            if (element.value.indexOf('Add') > -1) {
              element.value = 'Hide new Property';
            } else {
              element.value = 'Add new Property';
            }
            $scope.hideNewProperty = !$scope.hideNewProperty;
          };
          $scope.removeProperty = function(i) {
            var remKey = $scope.selectedFeature.properties[i].key;
            delete $scope.selectedFeature.feature.properties[remKey];
            $scope.selectedFeature.properties.splice(i, 1);
            updateFeature();
          };

        }
      };
    }
  ]);
