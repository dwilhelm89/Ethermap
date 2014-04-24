'use strict';

angular.module('CollaborativeMap')
  .directive('history', ['$http', 'MapHandler',
    function($http, MapHandler) {

      function startCompare(objA, objB) {

        var results = document.getElementById('results');
        results.innerHTML = '';

        compareTree(objA, objB, 'Feature', results);
      }

      function compareTree(a, b, name, results) {
        var typeA = typeofReal(a);
        var typeB = typeofReal(b);

        var typeSpanA = document.createElement('span');
        typeSpanA.appendChild(document.createTextNode('(' + typeA + ')'));
        typeSpanA.setAttribute('class', 'diff-typeName');

        var typeSpanB = document.createElement('span');
        typeSpanB.appendChild(document.createTextNode('(' + typeB + ')'));
        typeSpanB.setAttribute('class', 'diff-typeName');

        var aString = (typeA === 'object' || typeA === 'array') ? '' : String(a) + ' ';
        var bString = (typeB === 'object' || typeB === 'array') ? '' : String(b) + ' ';

        var leafNode = document.createElement('span');
        leafNode.appendChild(document.createTextNode(name));
        if (a === undefined) {
          leafNode.setAttribute('class', 'diff-added');
          leafNode.appendChild(document.createTextNode(': ' + bString));
          leafNode.appendChild(typeSpanB);
        } else if (b === undefined) {
          leafNode.setAttribute('class', 'diff-removed');
          leafNode.appendChild(document.createTextNode(': ' + aString));
          leafNode.appendChild(typeSpanA);
        } else if (typeA !== typeB || (typeA !== 'object' && typeA !== 'array' && a !== b)) {
          leafNode.setAttribute('class', 'diff-changed');
          leafNode.appendChild(document.createTextNode(': ' + aString));
          leafNode.appendChild(typeSpanA);
          leafNode.appendChild(document.createTextNode(' => ' + bString));
          leafNode.appendChild(typeSpanB);
        } else {
          leafNode.appendChild(document.createTextNode(': ' + aString));
          leafNode.appendChild(typeSpanA);
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

            compareTree(a && a[keys[i]], b && b[keys[i]], keys[i], li);
          }
          results.appendChild(listNode);
        } else {
          results.appendChild(leafNode);
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
        templateUrl: 'partials/history',
        replace: true,
        // transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function($scope) { //, iElm, iAttrs, controller) {
          var visible = false;

          $scope.hideDocumentRevisionView = false;
          $scope.hideDiffView = true;


          function init() {
            $scope.documentRevision = [];
            $scope.hideDocumentRevisionView = false;
            $scope.hideDiffView = true;
          }

          function loadHistory(fid) {
            init();
            console.log("load history");
            $http({
              method: 'GET',
              url: '/api/documentRevisions/' + $scope.mapId + '/' + fid
            })
              .
            success(function(data) { //, status, headers, config) {
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
            loadHistory(fid);
          };

          $scope.closeDiffView = function() {
            $scope.hideDocumentRevisionView = false;
            $scope.hideDiffView = true;
          };

          $scope.showChanges = function(fid, rev, index) {
            var length = $scope.documentRevision.length;
            if (length >= index + 1) {
              startCompare($scope.documentRevision[index], $scope.documentRevision[index + 1]);
            }
            $scope.hideDocumentRevisionView = true;
            $scope.hideDiffView = false;
          };
        }
      };
    }
  ]);
