'use strict';

/**
 * @memberof CollaborativeMap
 * @fileOverview MapHistory directive. Displays the actions which where performed on the map as a list (feature editing/creating/removing/reverting, etc.)
 *
 * @requires $http
 * @requires MapHandler
 *
 * @exports CollaborativeMap.mapHistory
 *
 * @author Dennis Wilhelm
 */

angular.module('CollaborativeMap')
  .directive('mapHistory', ['$http',
    function($http) {

      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'partials/maphistory',
        replace: true,
        scope: {},
        link: function(scope) { //, iElm, iAttrs, controller) {


          /**
           * Listen to the historyView event. Called when the toolbox history view is opened/closed
           */
          scope.$on('toolbox', function(e, view, hidden) {
            if (view === 'historyView' && !hidden) {
              loadMapHistory();
            }
          });

          /**
           * Manually append actions to the history.
           * Used to prevent multiple ajax calls to update the history.
           * Can result in different timestamps on different computers
           * @param {Object} event map draw event
           */
          scope.appendToHistory = function(event) {
            if (event.date) {
              if (!scope.history) {
                scope.history = [];
              }
              event.dateString = createDateString(event.date);
              scope.history.push(event);
            }
          };

          /**
           * Loads the current history for the map.
           * Appends the history to the scope for the history directive
           */
          function loadMapHistory() {
            $http({
              method: 'GET',
              url: '/api/history/' + scope.$root.mapId
            })
              .
            success(function(data) { //, status, headers, config) {
              data.forEach(function(action) {
                if (action.date) {
                  action.dateString = createDateString(action.date);
                }
              });
              scope.history = data;

            })
              .
            error(function(data) { //, status, headers, config) {
              console.log(data);
            });
          }

          /**
           * Opens a bootstrap modal to show the history of a single feature
           * @param {String} id the feature id
           */
          scope.showFeatureHistory = function(id) {
            scope.$root.$broadcast('showFeatureHistory', id);
          };

          /**
           * Create a human readable string out of the unix timestamp
           * @param {String} date  unix timestamp
           */

          function createDateString(date) {
            var tmpDate = new Date(date);
            var dateString = tmpDate.getHours() + ':' +
              tmpDate.getMinutes() + ':' + tmpDate.getSeconds() +
              ' - ' + tmpDate.getDate() + '.' +
              (tmpDate.getMonth() + 1) + '.' +
              tmpDate.getFullYear();

            return dateString;
          }




        }
      };
    }
  ]);
