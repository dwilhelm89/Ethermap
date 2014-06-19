'use strict';

/**
 * @memberof CollaborativeMap
 * @fileOverview MapHistory directive. Displays the actions which where performed on the map as a list (feature editing/creating/removing/reverting, etc.)
 *
 * @requires ApiService
 * @requires MapHandler
 *
 * @exports CollaborativeMap.mapHistory
 *
 * @author Dennis Wilhelm
 */

angular.module('CollaborativeMap')
  .directive('mapHistory', ['MapHandler', 'ApiService',
    function(MapHandler, ApiService) {

      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'partials/maphistory',
        replace: true,
        scope: {},
        link: function(scope) { //, iElm, iAttrs, controller) {

          scope.isShowMapHistory = true;
          scope.isShowFeatureHistory = false;

          /**
           * Listen to the historyView event. Called when the toolbox history view is opened/closed
           */
          scope.$on('toolbox', function(e, view, hidden) {
            if (view === 'historyView' && !hidden) {
              loadMapHistory();
            }
          });

          /**
           * Is this still used?
           */
          scope.$on('appendToHistory', function(e, updateEvent) {
            appendToHistory(updateEvent);
          });

          /**
           * Event listener for the feature history event. Called when the "show changes" buttons are clicked.
           * toggles the view so that the feature history can be shown
           */
          scope.$on('showFeatureHistory', function() {
            scope.isShowFeatureHistory = true;
            scope.isShowMapHistory = false;
          });

          /**
           * Event listener for the feature history close event.
           * Toggle the view for the map history and reload the history.
           */
          scope.$on('closeFeatureHistory', function() {
            scope.isShowFeatureHistory = false;
            scope.isShowMapHistory = true;
            loadMapHistory();
          });

          /**
           * Manually append actions to the history.
           * Used to prevent multiple ajax calls to update the history.
           * Can result in different timestamps on different computers
           * @param {Object} event map draw event
           */

          function appendToHistory(event) {
            if (event.date) {
              if (!scope.history) {
                scope.history = [];
              }
              event.dateString = createDateString(event.date);
              scope.history.push(event);
            }
          }

          /**
           * Loads the current history for the map.
           * Appends the history to the scope for the history directive
           */

          function loadMapHistory() {
            scope.loading = true;

            ApiService.getMapHistory(scope.$root.mapId)
              .then(function(result) {
                if (result && result.data) {
                  result.data.forEach(function(action) {
                    if (action.date) {
                      action.dateString = createDateString(action.date);
                    }
                  });
                  scope.history = reduceActions(result.data);
                }
                scope.loading = false;

              });
          }

          /**
           * Combine similar actions to avoid a map history pollution if one person makes many changes.
           * @param  {Array} values the history actions
           * @return {Array}        the aggregated history actions
           */

          function reduceActions(values) {
            var result = [];
            values.forEach(function(elem) {
              if (result.length === 0) {
                result.push(elem);
              } else {
                if (elem.user === result[result.length - 1].user) {
                  if (result[result.length - 1].actions) {
                    result[result.length - 1].actions.push(elem);
                    result[result.length - 1].number++;
                    result[result.length - 1].date = elem.date;
                    result[result.length - 1].dateString = elem.dateString;
                  } else {
                    result[result.length - 1] = {
                      user: elem.user,
                      actions: [result[result.length - 1], elem],
                      number: 2,
                      dateString: elem.dateString,
                      date: elem.date
                    };
                  }
                } else {
                  result.push(elem);
                }
              }
            });
            return result;
          }

          /**
           * Replace aggregated object in the history with the single actions
           * @param  {Object} action the aggregated object
           */
          scope.showHistoryDetails = function(action) {
            var index = scope.history.indexOf(action);
            var tmp = scope.history[index];
            delete scope.history[index];
            scope.history = scope.history.concat(tmp.actions);
          };

          /**
           * Opens a bootstrap modal to show the history of a single feature
           * @param {String} id the feature id
           */
          scope.showFeatureHistory = function(id) {
            scope.$root.$broadcast('showFeatureHistory', id);
          };

          /**
           * Pan to the a selected feature
           * @param  {String} fid feature id (= leaflet layer id)
           */
          scope.panToFeature = function(fid) {
            MapHandler.panToFeature(fid);
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
