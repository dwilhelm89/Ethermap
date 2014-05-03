'use strict';

/**
 * @memberof CollaborativeMap
 * @fileOverview Toolbox directive for all sidebar related functions (User, Tools, History, Help).
 *
 * @requires $http
 * @requires $compile
 * @requires MapHandler 
 *
 * @exports CollaborativeMap.toolbox
 *
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap')
  .directive('toolbox', ['$http', '$compile', 'MapHandler',
    function($http, $compile, MapHandler) {
      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'partials/toolbox',
        replace: true,

        link: function postLink($scope) {

          /**
          * Sets up the IntoJS tags by assigning the html attributes to element which are created at runtime.
          * Currently assigned directly to leaflet and therefore not generic!
          */
          function setUpIntroJS() {
            var drawFeatures = document.getElementsByClassName('leaflet-draw-toolbar leaflet-bar')[0];
            drawFeatures.setAttribute('data-intro', 'These are the drawing tools. They can be used to create markers, lines and polygons.');

            var editFeature = document.getElementsByClassName('leaflet-draw-toolbar leaflet-bar')[1];
            editFeature.setAttribute('data-intro', 'Click here to edit/delete the geometry of features. Click on a feature in the map to edit it\'s properties');
          }

          /**
          * Start the IntoJS tour
          */
          $scope.startIntroJS = function() {
            setUpIntroJS();
            /*global introJs */
            introJs().start();
          };

          /**
          * Variables used by the html tool elements via ng-class.
          * If true, sets the hide class to the elements.
          */ 
          $scope.views = {
            userView: true,
            historyView: true,
            toolBarIn: true,
            settingsView: true,
            toolsView: true
          };

          $scope.toggleToolbar = function(view) {
            var vs = $scope.views;
            if (vs.toolBarIn) {
              vs.toolBarIn = false;
              vs[view] = false;
            } else if (!vs[view]) {
              hideAllViews();
            } else {
              hideAllViews();
              vs.toolBarIn = false;
              vs[view] = false;
            }
            //emit event if toolbox windows opens/closes
            $scope.$emit(view, vs[view]);
          };

          function hideAllViews() {
            var vs = $scope.views;
            for (var key in vs) {
              vs[key] = true;
            }
          }

          /**
          * Store all users which are supposed to be watched. Is used by the mapMovement service to check if the map should change when other users move the map
          */
          $scope.watchUsers = {};
          $scope.watchUser = function(userId, event) {
            if ($scope.watchUsers[userId]) {
              delete $scope.watchUsers[userId];
              event.currentTarget.innerHTML = 'Watch';
            } else {
              $scope.watchUsers[userId] = true;
              event.currentTarget.innerHTML = 'Unwatch';
            }
          };

          /**
          * Paint a rectangle on the map to show the viewport of other users
          */
          $scope.userBounds = {};
          $scope.getUserBounds = function(userId) {
            var bounds = $scope.userBounds[userId];
            if (bounds) {
              MapHandler.paintUserBounds(bounds);
            } else {
              window.alert('The user hasn\'t mooved since you logged in');
            }
          };

          /**
          * Watch all users
          */
          $scope.isWatchingAll = false;
          $scope.watchAll = function() {
            $scope.isWatchingAll = !$scope.isWatchingAll;
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

          /**
          * Manually append actions to the history. 
          * Used to prevent multiple ajax calls to update the history.
          * Can result in different timestamps on different computers
          * @param {Object} event map draw event
          */
          $scope.appendToHistory = function(event) {
            if (event.date) {
              event.dateString = createDateString(event.date);
              $scope.history.push(event);
            }
          };

          /**
          * Loads the current history for the map.
          * Appends the history to the scope for the history directive
          */
          $scope.loadHistory = function() {
            $http({
              method: 'GET',
              url: '/api/history/' + $scope.mapId
            })
              .
            success(function(data) { //, status, headers, config) {
              data.forEach(function(action) {
                if (action.date) {
                  action.dateString = createDateString(action.date);
                }
              });
              $scope.history = data;

            })
              .
            error(function(data) { //, status, headers, config) {
              console.log(data);
            });

          };

          /**
          * Opens a bootstrap modal to show the history of a single feature
          * @param {String} id the feature id
          */
          $scope.showFeatureHistory = function(id) {
            $scope.toggleHistoryModal(id);
          };

          /**
          * Pans to a selcted featured
          * @param {String} id feature id
          */
          $scope.panToFeature = function(id) {
            MapHandler.panToFeature(id);
          };

        }
      };
    }
  ]);
