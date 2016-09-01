'use strict';
/**
 * @memberof CollaborativeMap
 * @fileOverview History diretctive. Shows the history of a single feature within a bootstrap modal. Allows reverting features.
 * Shows diffs either as a map view or as a textual diff.
 * @exports CollaborativeMap.History
 *
 * @requires ApiService
 * @requires MapHandler
 *
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap')
  .directive('featureHistory', ['MapHandler', 'ApiService',
    function(MapHandler, ApiService) {

      /**
       * Initialize the textual diff
       * @pram {Object} objA Object 1
       * @pram {Object} objB Object 2
       * @pram {String} divId id of the html parent element
       * @pram {String} name headline for the view
       */

      function startCompare(objA, objB, divId, name, hasChanges) {
        hasChanges[divId] = false;
        var results = document.getElementById(divId);
        results.innerHTML = '';

        compareTree(objA, objB, name, results, divId, hasChanges);
      }

      /**
       * Actual diff method
       * @param {Object} a Object 1
       * @param {Object} b Object 2
       * @param {String} name headline for the view
       * @param {Object} results html element for the results
       */

      function compareTree(a, b, name, results, divId, hasChanges) {
        var typeA = typeofReal(a);
        var typeB = typeofReal(b);

        var aString = (typeA === 'object' || typeA === 'array') ? '' : String(a) + ' ';
        var bString = (typeB === 'object' || typeB === 'array') ? '' : String(b) + ' ';

        var leafNode = document.createElement('span');
        leafNode.appendChild(document.createTextNode(name));
        if (a === undefined) {
          hasChanges[divId] = true;
          leafNode.setAttribute('class', 'diff-added');
          leafNode.appendChild(document.createTextNode(': ' + bString));
        } else if (b === undefined) {
          hasChanges[divId] = true;
          leafNode.setAttribute('class', 'diff-removed');
          leafNode.appendChild(document.createTextNode(': ' + aString));
        } else if (typeA !== typeB || (typeA !== 'object' && typeA !== 'array' && a !== b)) {
          hasChanges[divId] = true;
          leafNode.setAttribute('class', 'diff-changed');
          leafNode.appendChild(document.createTextNode(': ' + aString));
          leafNode.appendChild(document.createTextNode(' => ' + bString));
        } else {
          // leafNode.appendChild(document.createTextNode(': ' + aString));
        }

        if (typeA === 'object' || typeA === 'array' || typeB === 'object' || typeB === 'array') {
          var keys = [];
          for (var i in a) {
            if (a.hasOwnProperty(i)) {
              keys.push(i);
            }
          }
          for (var i in b) {
            if (b.hasOwnProperty(i)) {
              keys.push(i);
            }
          }
          keys.sort();

          var listNode = document.createElement('ul');
          listNode.appendChild(leafNode);

          for (var i = 0; i < keys.length; i++) {
            if (keys[i] === keys[i - 1]) {
              continue;
            }
            var li = document.createElement('li');
            listNode.appendChild(li);

            compareTree(a && a[keys[i]], b && b[keys[i]], keys[i], li, divId, hasChanges);
          }
          results.appendChild(listNode);
        } else {
          results.appendChild(leafNode);
          return hasChanges;
        }
      }

      function isArray(value) {
        return value && typeof value === 'object' && value.constructor === Array;
      }

      function typeofReal(value) {
        return isArray(value) ? 'array' : typeof value;
      }


      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'partials/featurehistory',
        replace: true,
        scope: {},

        link: function($scope, element) { //, iElm, iAttrs, controller) {
          //Scope variables (used in the gui)
          $scope.currentRevisionIndex = 0;
          $scope.currentRevision = undefined;
          $scope.documentRevision = [];
          $scope.numberOfRevisions = undefined;
          $scope.loading = true;

          var documentRevisions;
          var slider = element[0].getElementsByClassName('verticalSlider')[0];

          /**
           * Cleans up the revision variables and emits the 'closeFeatureHistory' event.
           * Used by the mapHistoryDirective to show the default map history
           */
          $scope.backToHistory = function() {
            cleanUp();
            $scope.$root.$broadcast('closeFeatureHistory');

          };

          /**
           * Event called when clicking the "view changes" buttons.
           * Initializes the feature history with the given feature id
           */
          $scope.$on('showFeatureHistory', function(e, fid) {
            init(fid);
          });

          /**
           * Remove the feature revisions if a different toolbox view is opened.
           */
          $scope.$on('toolbox', function() {
            if ($scope.currentRevision) {
              cleanUp();
              $scope.$root.$broadcast('closeFeatureHistory');
            }
          });

          /**
           * Load the document revisions history and clear eixisting values.
           * @param  {string} fid feature id
           */

          function init(fid) {
            $scope.documentRevision = [];
            $scope.currentRevisionIndex = 0;
            loadDocumentHistory(fid);
          }

          /**
           * Remove the document revisions from all variables.
           * This automatically clears the view.
           * Redraws the newest revision in the map.
           */

          function cleanUp() {
            setOriginalFeature();
            $scope.currentRevisionIndex = 0;
            $scope.currentRevision = undefined;
            $scope.documentRevision = [];
            $scope.numberOfRevisions = undefined;
          }

          /**
           * Remove the "diffFeature" from the map and redraw the newest revision
           */

          function setOriginalFeature() {
            MapHandler.removeLayerFid('diff-' + $scope.currentRevision._id);
            MapHandler.addFeatureAfterDiff($scope.currentRevision._id, documentRevisions[0]);
          }

          /**
           * Remove the original feature from the map
           */

          function removeOriginalFeature() {
            var fid = documentRevisions[0]._id;
            MapHandler.removeLayerFid(fid);
          }

          /**
           * Assignes the scope variables with the current revisions.
           * Removes the original feature from the map so that only the "diff features" are shown.
           * Init the slider setup.
           */

          function initView() {
            if (documentRevisions) {
              $scope.numberOfRevisions = documentRevisions.length;
              if ($scope.numberOfRevisions > 0) {
                removeOriginalFeature();
                setCurrentRevision(0);
                setUpSlider();
              }
            }
          }

          /**
           * Initializes the range slider with the number of document revisions.
           * Sets the current value to the number of revisions so that the slider starts with the top position.
           */

          function setUpSlider() {
            if (slider) {
              slider.max = $scope.numberOfRevisions;
              $scope.sliderValue = $scope.numberOfRevisions;
              slider.min = 1;
            }
          }

          /**
           * OnChange method of the range slider. Numbers have to be inverted so that the newest revision is on top.
           */
          $scope.sliderChange = function() {
            setCurrentRevision($scope.numberOfRevisions - $scope.sliderValue);
          };

          /**
           * Fill the changes diff with the textual diff representation
           * @param  {Number} index document revision array index
           */

          function getPropertyDiff(index) {
            if ($scope.numberOfRevisions > index + 1 && !$scope.currentRevision._deleted) {
              //Textual diff for properties
              startCompare(documentRevisions[index + 1].properties, documentRevisions[index].properties, 'diffProperties', 'Properties', $scope.hasChanges);
              //Textual diff for geometry
              //startCompare(documentRevisions[index + 1].geometry.coordinates, documentRevisions[index].geometry.coordinates, 'diffGeometry', 'Geometry', $scope.hasChanges);
            }
          }

          /**
           * Sets the current revision with the next revision index
           */
          $scope.previousRevision = function() {
            if ($scope.numberOfRevisions > $scope.currentRevisionIndex + 1) {
              setCurrentRevision($scope.currentRevisionIndex + 1);
            }
          };

          /**
           * Sets the current revision with the previous revision index
           */
          $scope.nextRevision = function() {
            if ($scope.currentRevisionIndex > 0) {
              setCurrentRevision($scope.currentRevisionIndex - 1);
            }
          };

          /**
           * Sets a revision to the scope variables based on its index in the revisions array.
           *
           * @param {Number} index array index
           */

          function setCurrentRevision(index) {
            $scope.currentRevisionIndex = index;
            $scope.currentRevision = documentRevisions[index];
            getPropertyDiff(index);
            var fid = 'diff-' + $scope.currentRevision._id;
            $scope.sliderValue = $scope.numberOfRevisions - index;
            MapHandler.removeLayerFid(fid);
            MapHandler.updateLayerForDiff(fid, $scope.currentRevision);
            MapHandler.highlightFeatureId(fid);
          }


          /**
           * Request all revisions from the database.
           * Initialize the views.
           * @param {String} fid feature id
           */

          function loadDocumentHistory(fid) {
            if (fid) {
              $scope.loading = true;
              init();
              ApiService.getFeatureHistory($scope.$root.mapId, fid)
                .then(function(result) {
                  $scope.loading = false;
                  if (result.data) {
                    documentRevisions = result.data;
                    initView();
                  }
                });
            }
          }

          /**
           * Revert a feature to a given revision.
           * @param {String} id the feature id
           * @param {String} rev the revision to which the feature will be reverted
           */
          $scope.revertFeature = function(id, rev) {
            MapHandler.revertFeature($scope.$root.mapId, id, rev, $scope.$root.userName);
            setTimeout(function() {
              loadDocumentHistory(id);
            }, 100);
          };

          /**
           * Recreate a deleted feature
           * @param {String} id feature id
           * @param {Object} feature the feature
           */
          $scope.restoreDeletedFeature = function(id, feature) {
            MapHandler.restoreDeletedFeature($scope.$root.mapId, id, feature, $scope.$root.userName);
            setTimeout(function() {
              loadDocumentHistory(id);
            }, 100);
          };

          //Variables are changed while the textual diff is created.
          //Used by the GUI to decide which view to display.
          $scope.hasChanges = {
            diffGeometry: false,
            diffProperties: false
          };

          /**
           * Checks the action attribute of a feature to decide if there have been geometry changes (true) or property changes (false).
           * @param  {String}  action the action string of the feature
           * @return {Boolean}        true if there are geometry changes
           */
          $scope.hasGeomChanges = function(action) {
            var geomChanges = ['created feature', 'deleted feature', 'edited geometry', 'restored', 'imported feature'];
            return geomChanges.indexOf(action) > -1;
          };

          /**
           * Open the textual diff
           * Close the revisions view and the map diff
           * @param {String} fid the feature id
           * @param {String} rev the revision key
           * @param {Number} index index of the revisions array
           */
          $scope.showTextDiff = function(fid, rev, index) {
            var length = $scope.documentRevision.length;
            if (length >= index + 1) {
              startCompare($scope.documentRevision[index + 1].properties, $scope.documentRevision[index].properties, 'diffProperties', 'Properties', $scope.hasChanges);
              startCompare($scope.documentRevision[index + 1].geometry.coordinates, $scope.documentRevision[index].geometry.coordinates, 'diffGeometry', 'Geometry', $scope.hasChanges);
            }
            $scope.hideDocumentRevisionView = true;
            $scope.hideDiffView = false;
          };

        }
      };
    }
  ]);
