'use strict';
/**
 * @memberof CollaborativeMap
 * @fileOverview Directive which to handle feature properties. Allows adding/editing/deleting properties
 * @exports CollaborativeMap.FeaturePropertiesDirective *
 *
 * @requires  $compile
 * @requires ApiService
 * @requires MapHandler
 *
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap')
  .directive('featureproperties', ['$compile', 'MapHandler', 'ApiService',
    function($compile, MapHandler, ApiService) {

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
          $scope.selectFeature = function(feature, editByUser) {

            //TODO: filter simplestyle spec items: https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0

            //jshint camelcase:false
            activateToolbox();

            cleanSelection();
            var lastEditedBy;
            if (feature.feature && feature.feature.user) {
              lastEditedBy = feature.feature.user;
            }else{
              lastEditedBy = $scope.userName;
            }

            $scope.selectedFeature = {
              'properties': [],
              'fid': feature._leaflet_id,
              'user': lastEditedBy
            };

            selectCategoriesForGeomType(feature);

            var tmpGeoJSON = $scope.selectedFeature.feature = feature.toGeoJSON();

            //Create an Array containing all properties. Has to be included in the feature again
            for (var prop in tmpGeoJSON.properties) {
              if (allowedProp(prop)) {
                $scope.selectedFeature.properties.push({
                  'key': prop,
                  'value': tmpGeoJSON.properties[prop]
                });
              }
            }

            //Preselect the selectboxes if a category/preset is available
            if (tmpGeoJSON.properties && tmpGeoJSON.properties.category) {
              $scope.selectedCategory = tmpGeoJSON.properties.category;
              setPresetsInScope($scope.selectedCategory);
              setTimeout(function() {
                $('#categorySelect')[0].value = $scope.selectedCategory;
              }, 40);
            }
            if (tmpGeoJSON.properties && tmpGeoJSON.properties.preset) {
              var i = getPresetIndex(tmpGeoJSON.properties.preset);
              $scope.selectedPreset = i;
              //Wait to let the gui render first and set the selected index for the selectbox
              setTimeout(function() {
                $('#presetSelect')[0].selectedIndex = parseInt(i) + 1;
              }, 40);

            }

            $scope.editByUser = editByUser;

            //$apply has to be called manually, if the function is called from a different event (here leaflet click)
            if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
              $scope.$apply();
            }

          };

          $scope.$on('editHandlerUpdate', function(event, data) {
            $scope.editByUser = data;
            //$apply has to be called manually, if the function is called from a different event (here leaflet click)
            if ($scope.$root.$$phase !== '$apply' && $scope.$root.$$phase !== '$digest') {
              $scope.$apply();
            }
          });


          /**
           * Opens a bootstrap modal to show the history of a single feature
           * @param {String} id the feature id
           */
          $scope.showFeatureHistory = function(id) {
            $scope.$root.$broadcast('showFeatureHistory', id);
            $scope.$root.$broadcast('openToolbox', 'historyView');
          };

          /**
           * Checks if a property should be displayed or not
           * @param  {String} prop the property
           * @return {Boolean}      true if the property should be displayed, false if not
           */

          function allowedProp(prop) {
            var notAllowed = ['category', 'preset', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'fill'];
            //var notAllowed = ['category', 'preset'];
            if (notAllowed.indexOf(prop) > -1) {
              return false;
            } else {
              return true;
            }
          }


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

          function removePropertyType(type) {
            for (var i = $scope.selectedFeature.properties.length - 1; i >= 0; i--) {
              if ($scope.selectedFeature.properties[i].key === type) {
                $scope.selectedFeature.properties.splice(i, 1);
              }
            }
            delete $scope.selectedFeature.feature.properties[type];
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
              var newClassName = replaceAll(' hidden', '', $('#stopEditBtn')[0].className);
              $('#stopEditBtn')[0].className = newClassName;

            }
          }

          function replaceAll(find, replace, str) {
            return str.replace(new RegExp(find, 'g'), replace);
          }

          /**
           * Hide the button to stop the edit mode
           */

          function hideStopEditingBtn() {
            $('#stopEditBtn')[0].className += ' hidden';
          }

          /**
           * Listen to the editHandler events to show or hide the "Stop Editing" button
           */
          $scope.$on('editHandler', function(e, eventValue) {
            if (!eventValue) {
              hideStopEditingBtn();
            } else {
              showStopEditingBtn();
            }
          });

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

          /**
           * Cancel the edit mode if the toolbox window is closed.
           */
          $scope.$on('toolbox', function() {
            if ($scope.views.toolsView) {
              MapHandler.removeEditHandler();
            }
          });


          //NEW CATEGORIES SYSTEM
          var presets;
          var fields;
          var categories;

          /**
           * Select the suitable categories for the given feature based on the geometry type.
           * Put the selection in the scope variable for the GUI
           * @param  {Object} layer selected feature
           */

          function selectCategoriesForGeomType(layer) {
            var geomType = MapHandler.getLayerType(layer);
            $scope.categories = {};

            for (var key in categories) {
              if (categories[key].geometry.indexOf(geomType) > -1) {
                $scope.categories[key] = categories[key];
              }
            }
          }

          /**
           * Remove selected category and preset from the scope
           */

          function cleanSelection() {
            $scope.presets = undefined;
            $scope.selectedCategory = undefined;
            $scope.selectedPreset = undefined;
          }

          /**
           * GET request to load the category/preset and fields information from the server.
           * Stores the categories in the scope for the select box.
           * Fields and presets will be used as soon as a category has been chosen.
           */

          function getPresetData() {

            ApiService.getPresetData().then(function(result) {
              if (result && result.length === 3) {
                categories = result[0];
                fields = result[1];
                presets = result[2];
              }
            });
          }

          /**
           * If a category is selected, append the sub categories (presets) to a second select box.
           * Saves the category in the feature and call the update function to sync the feature.
           */
          $scope.selectPresets = function() {
            $scope.cancelEditMode();
            $scope.fields = [];
            $scope.selectedPreset = undefined;
            var selCategory = $scope.selectedCategory;

            if (selCategory) {
              //Update the feature
              $scope.selectedFeature.feature.properties.category = selCategory;
              setStyleFromCategory(selCategory);
              MapHandler.updateOnlyProperties($scope.selectedFeature);

              //Set to scope array
              setPresetsInScope(selCategory);

            }
          };

          /**
           * Removes existing simplestyle properties and sets the new ones
           * based on the configured category styles.
           * @param {Object} category the chosen osm category
           */

          function setStyleFromCategory(category) {
            var style = categories[category].style;
            var selFeature = $scope.selectedFeature.feature;
            removeExistingStyle(selFeature);
            for (var key in style) {
              selFeature.properties[key] = style[key];
            }
          }

          /**
           * Removes existing simplestyle properties from the given feature
           * @param  {Object} feature the GeoJSON feature
           */

          function removeExistingStyle(feature) {
            var simpleStyleKeys = [
              'marker-size',
              'marker-symbol',
              'marker-color',
              'stroke',
              'stroke-opacity',
              'stroke-width',
              'fill',
              'fill-opacity'
            ];
            simpleStyleKeys.forEach(function(styleKey) {
              delete feature.properties[styleKey];
            });
          }

          /**
           * Append the presets to the scope variable to fill the select box.
           */

          function setPresetsInScope(category) {
            $scope.presets = [];
            $scope.presets = [];
            //Get the member of the chosen category = presets
            var members = categories[category].members || [];
            members.forEach(function(member) {
              $scope.presets.push(presets[member]);
            });

          }

          /**
           * Returns the index of a preset in the categories member array
           * @param  {String} presetKey object key
           * @return {String}           Key of the categories member array
           */

          function getPresetIndex(presetKey) {
            var members = categories[$scope.selectedCategory].members;
            for (var key in members) {
              if (presetKey === members[key]) {
                return key;
              }
            }
          }

          /**
           * Called if the preset is selected.
           * Updates the feature and cally update to sync.
           *
           * Checks if the preset is associated with fields and adds new ones to the properties.
           */
          $scope.selectFields = function() {
            $scope.cancelEditMode();

            var members;
            $scope.fields = [];
            if ($scope.selectedPreset) {
              //Update the feature
              var oldPreset = $scope.selectedFeature.feature.properties.preset;
              $scope.selectedFeature.feature.properties.preset = getSelectedPresetName($scope.selectedPreset);
              MapHandler.updateOnlyProperties($scope.selectedFeature);

              members = $scope.presets[$scope.selectedPreset].fields || [];

              //Remove the fields of older presets from the feature
              if (oldPreset) {
                var oldMembers = presets[oldPreset].fields || [];
                if (oldMembers) {
                  oldMembers.forEach(function(member) {
                    //only delete members if they aren't used by the new preset
                    if (members.indexOf(member) === -1) {
                      var index = $scope.fields.indexOf(fields[member]);
                      if (index > -1) {
                        $scope.fields.splice(index, 1);
                      }
                      removePropertyType(fields[member].label);
                    }
                  });
                }
              }


              //Get the fields of the preset
              members = $scope.presets[$scope.selectedPreset].fields || [];
              members.forEach(function(member) {
                var newKey = fields[member].label;
                //Only append if not already existing
                if (!$scope.selectedFeature.feature.properties.hasOwnProperty(newKey)) {
                  addNewPropertyType(newKey);
                }
                //Scope array for the GUI
                $scope.fields.push(fields[member]);
              });

            }

          };

          /**
           * Returns the key of the selected preset (sub-category)
           * @param  {String} index the key of the categories member object
           * @return {String}       preset name
           */

          function getSelectedPresetName(index) {
            if (index && $scope.categories[$scope.selectedCategory] && $scope.categories[$scope.selectedCategory].members && $scope.categories[$scope.selectedCategory].members[index]) {
              return $scope.categories[$scope.selectedCategory].members[index];
            }
          }

          getPresetData();



        }
      };
    }
  ]);
