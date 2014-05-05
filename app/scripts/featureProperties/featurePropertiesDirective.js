'use strict';
/**
 * @memberof CollaborativeMap
 * @fileOverview Directive which to handle feature properties. Allows adding/editing/deleting properties
 * @exports CollaborativeMap.FeaturePropertiesDirective
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap')
  .directive('featureproperties', ['$compile', 'MapHandler',
    function($compile, MapHandler) {

      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'partials/featureproperties',
        replace: true,
        link: function postLink($scope) {

          /**
           * Toggles the visibility of the featureproprties view
           */

          function activateToolbox() {
            if ($scope.views.toolBarIn) {
              $scope.toggleToolbar('toolsView');
              $scope.$apply();
            } else if ($scope.views.toolsView) {
              $scope.toggleToolbar('toolsView');
              $scope.$apply();
            }

          }

          /**
           * Opens the featureproperties view, sets the feature as the selected feature within the scope
           * Pushes the properties to the scope array which is used in ng-repeat
           * Called from the feature onClick through the map services.
           * @param {Object} feature the leaflet layer
           */
          $scope.selectFeature = function(feature) {

            //TODO: filter simplestyle spec items: https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0

            //jshint camelcase:false
            activateToolbox();

            $scope.selectedFeature = {
              'properties': [],
              'fid': feature._leaflet_id
            };

            var tmpGeoJSON = $scope.selectedFeature.feature = feature.toGeoJSON();

            //Create an Array containing all properties. Has to be included in the feature again
            for (var prop in tmpGeoJSON.properties) {
              $scope.selectedFeature.properties.push({
                'key': prop,
                'value': tmpGeoJSON.properties[prop]
              });
            }

            //$apply has to be called manually, if the function is called from a different event (here leaflet click)
            if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
              $scope.$apply();
            }

          };

          /**
           * Calls the MapHandler functions to save the current editing
           */
          $scope.saveChanges = function() {
            MapHandler.saveEditedFeature();
            
            //Save the property changes made in the GUI
            updateFeature();
            
          };

          /**
           * Calls the MapHandler functions to revert/cancel the current editing
           */
          $scope.revertChanges = function() {
            MapHandler.revertEditedFeature();
          };

          /**
           * Include the feature properties back into the layer and call the update function
           */

          function updateFeature() {
            $scope.selectedFeature.properties.forEach(function(prop) {
              $scope.selectedFeature.feature.properties[prop.key] = prop.value;
            });
            MapHandler.updateOnlyProperties($scope.selectedFeature);
          }

          /**
           * Adds a new property to the feature.
           * @param {Number} key key code of the ng-key event
           */
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

          //Variable used to controle the 'hide' class via ng-class
          $scope.hideNewProperty = true;

          /**
           * Show the GUI form to create new properties
           * @param {Object} e html button
           */
          $scope.addNewProperty = function(e) {
            var element = e.currentTarget;
            if (element.value.indexOf('Add') > -1) {
              element.value = 'Hide new Property';
            } else {
              element.value = 'Add new Property';
            }
            $scope.hideNewProperty = !$scope.hideNewProperty;
          };

          /**
           * Remove a given property from the feature. Updates the feature afterwards.
           * @param {Number} i index of the properties Array
           */
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
