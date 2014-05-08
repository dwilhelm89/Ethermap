'use strict';
/**
 * @memberof CollaborativeMap
 * @fileOverview Directive which to handle feature properties. Allows adding/editing/deleting properties
 * @exports CollaborativeMap.FeaturePropertiesDirective
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap')
  .directive('featureproperties', ['$compile', 'MapHandler', '$http', '$q',
    function($compile, MapHandler, $http, $q) {

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

            showStopEditingBtn();

            //$apply has to be called manually, if the function is called from a different event (here leaflet click)
            if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
              $scope.$apply();
            }

          };


          var lastChange = -1;
          /**
           * Gets called if a property changes. Only send a change every 1s if no further changes have been made in between to prevent submits on every keystroke.
           */
          $scope.propertyChanged = function() {
            lastChange = new Date().getTime();
            setTimeout(function() {
              var tmpDate = new Date().getTime();
              if ((tmpDate - lastChange) > 900) {
                console.log('update property');
                updateFeature();
              }
            }, 1000);
          };

          /**
           * Calls the MapHandler functions to revert/cancel the current editing
           */
          $scope.cancelEditMode = function() {
            MapHandler.removeEditHandler();
            hideStopEditingBtn();
          };

          /**
           * Deletes the currently selected feature
           */
          $scope.deleteFeature = function() {
            MapHandler.deleteFeature();
            $scope.selectedFeature = undefined;
            $scope.toggleToolbar('toolsView');

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

          /**
           * Adds a new property to the feature.
           * @param {String} type the property type
           */

          function addNewPropertyType(type) {
            $scope.selectedFeature.properties.push({
              'key': type,
              'value': ''
            });
            updateFeature();
          }

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
           * Show the button to stop the edit mode
           */

          function showStopEditingBtn() {
            if ($('#stopEditBtn').length > 0) {
              $('#stopEditBtn')[0].className = $('#stopEditBtn')[0].className.replace(' hidden', '');

            }
          }

          /**
           * Hide the button to stop the edit mode
           */

          function hideStopEditingBtn() {
            $('#stopEditBtn')[0].className += ' hidden';
          }

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

          $scope.$on('toolbox', function() {
            if ($scope.views.toolsView) {
              MapHandler.removeEditHandler();
            }
          });


          //NEW CATEGORIES SYSTEM
          var presets;
          var fields;

          function getPresetData() {
            var categoriesPromise = $http.get('presets/categories'),
              fieldsPromise = $http.get('presets/fields'),
              presetsPromise = $http.get('presets/presets');

            $q.all([categoriesPromise, fieldsPromise, presetsPromise]).then(function(resultArray) {
              if (resultArray) {
                if (resultArray[0] && resultArray[0].data) {
                  $scope.categories = resultArray[0].data;
                }
                if (resultArray[1] && resultArray[1].data) {
                  fields = resultArray[1].data;
                }
                if (resultArray[2] && resultArray[2].data) {
                  presets = resultArray[2].data;
                }
              }
            });
          }

          $scope.selectPresets = function(a, b, c) {
            console.log('select preset');
            var members;
            $scope.fields = [];
            if ($scope.selectedCategory && $scope.selectedCategory.members) {
              $scope.presets = [];
              members = $scope.selectedCategory.members;
              members.forEach(function(member) {
                $scope.presets.push(presets[member]);
              });
              console.log($scope.presets);

            }
          };

          $scope.selectFields = function() {
            console.log('select field');
            var members;
            $scope.fields = [];
            if ($scope.selectedPreset && $scope.selectedPreset.fields) {
              members = $scope.selectedPreset.fields;
              members.forEach(function(member) {
                var newKey = fields[member].label;
                if (!$scope.selectedFeature.feature.properties.hasOwnProperty(newKey)) {
                  addNewPropertyType(newKey);
                }
                $scope.fields.push(fields[member]);
              });
              console.log($scope.fields);

            }
          };

          getPresetData();



        }
      };
    }
  ]);
