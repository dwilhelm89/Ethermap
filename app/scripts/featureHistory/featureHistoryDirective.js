'use strict';
/**
 * @memberof CollaborativeMap
 * @fileOverview History diretctive. Shows the history of a single feature within a bootstrap modal. Allows reverting features.
 * Shows diffs either as a map view or as a textual diff.
 * @exports CollaborativeMap.History
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap')
  .directive('featureHistory', ['$http', 'MapHandler',
    function($http, MapHandler) {

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

        link: function($scope) { //, iElm, iAttrs, controller) {
          //Scope variables (used in the gui)
          $scope.currentRevisionIndex = 0;
          $scope.currentRevision = undefined;
          $scope.documentRevision = [];
          $scope.numberOfRevisions = undefined;
          $scope.loading = true;

          var documentRevisions;

          $scope.backToHistory = function() {
            cleanUp();
            $scope.$root.$broadcast('closeFeatureHistory');

          };

          $scope.$on('showFeatureHistory', function(e, fid) {
            init(fid);
          });

          $scope.$on('toolbox', function() {
            if ($scope.currentRevision) {
              cleanUp();
              $scope.$root.$broadcast('closeFeatureHistory');
            }
          });


          function init(fid) {
            $scope.documentRevision = [];
            $scope.currentRevisionIndex = 0;
            loadDocumentHistory(fid);
          }

          function cleanUp() {
            setOriginalFeature();
            $scope.currentRevisionIndex = 0;
            $scope.currentRevision = undefined;
            $scope.documentRevision = [];
            $scope.numberOfRevisions = undefined;
          }

          function setOriginalFeature() {
            MapHandler.addFeatureAfterDiff($scope.currentRevision._id, documentRevisions[0]);
          }

          function initView() {
            if (documentRevisions) {
              $scope.numberOfRevisions = documentRevisions.length;
              if ($scope.numberOfRevisions > 0) {
                setCurrentRevision(0);
              }
            }
          }

          function getPropertyDiff(index) {
            if ($scope.numberOfRevisions > index + 1 && !$scope.currentRevision._deleted) {
              startCompare(documentRevisions[index + 1].properties, documentRevisions[index].properties, 'diffProperties', 'Properties', $scope.hasChanges);
              //startCompare(documentRevisions[index + 1].geometry.coordinates, documentRevisions[index].geometry.coordinates, 'diffGeometry', 'Geometry', $scope.hasChanges);
            }
          }

          $scope.previousRevision = function() {
            if ($scope.numberOfRevisions > $scope.currentRevisionIndex + 1) {
              setCurrentRevision($scope.currentRevisionIndex + 1);
            }
          };

          $scope.nextRevision = function() {
            if ($scope.currentRevisionIndex > 0) {
              setCurrentRevision($scope.currentRevisionIndex - 1);
            }
          };

          function setCurrentRevision(index) {
            $scope.currentRevisionIndex = index;
            $scope.currentRevision = documentRevisions[index];
            getPropertyDiff(index);
            var fid = $scope.currentRevision._id;
            MapHandler.removeLayerForDiff(fid);
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
              $http({
                method: 'GET',
                url: '/api/documentRevisions/' + $scope.$root.mapId + '/' + fid
              })
                .
              success(function(data) { //, status, headers, config) {
                documentRevisions = data;
                $scope.loading = false;
                initView();
              })
                .
              error(function() { //, status, headers, config) {
                $scope.loading = false;
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


          $scope.hasChanges = {
            diffGeometry: false,
            diffProperties: false
          };


          $scope.hasGeomChanges = function(action) {
            var geomChanges = ['created feature', 'deleted feature', 'edited geometry', 'restored'];
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
