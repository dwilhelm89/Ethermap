'use strict';

/**
 * @memberof CollaborativeMap
 * @fileOverview Toolbox directive for all sidebar related functions (User, Tools, History, Help).
 *
 * @requires $compile
 * @requires MapHandler
 *
 * @exports CollaborativeMap.toolbox
 *
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap')
  .directive('toolbox', ['$compile', 'MapHandler','Users',
    function($compile, MapHandler, Users) {
      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'partials/toolbox',
        replace: true,

        link: function postLink($scope, elements) {
          /**
           * Sets up the IntoJS tags by assigning the html attributes to element which are created at runtime.
           * Currently assigned directly to leaflet and therefore not generic!
           */

          function setUpIntroJS() {
            /*global introJs */
            var jsIntro = introJs();

            var drawFeatures = document.getElementsByClassName('leaflet-draw-toolbar leaflet-bar')[0];
            drawFeatures.setAttribute('data-intro', 'These are the drawing tools. They can be used to create markers (e.g. points of interest), lines (e.g. streets, rivers) and polygons (e.g. buildings, parks).<br><a href="images/create_edit.gif" target="_blank">Demo</a>');
            drawFeatures.setAttribute('data-step', '1');

            jsIntro.onbeforechange(function(targetElement) {
              console.log('before new step', targetElement);
            });

            jsIntro.onafterchange(function(targetElement) {
              var rightDif = $(window).width() - targetElement.getBoundingClientRect().right;
              if (rightDif < 100) {
                setTimeout(function() {
                  $('.introjs-tooltip')[0].style.marginLeft = '-50px';
                }, 500);
              }
            });

            return jsIntro;
          }

          /**
           * Start the IntoJS tour
           */
          $scope.startIntroJS = function() {
            setUpIntroJS().start();

          };

          /**
           * Variables used by the html tool elements via ng-class.
           * If true, sets the hide class to the elements.
           */
          $scope.views = {
            userView: true,
            historyView: true,
            toolBarIn: true,
            propertiesView: true,
            toolsView: true
          };

          $scope.$on('openToolbox', function(e, view){
            $scope.toggleToolbar(view);
          });

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
            $scope.$broadcast('toolbox', view, vs[view]);
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
              MapHandler.paintUserBounds(bounds, Users.getUserById(userId).color || 'undefined');
            } else {
              window.alert('The user hasn\'t moved since you logged in');
            }
          };

          $scope.getAllUserBounds = function(){
            var users = {};
            for(var key in $scope.userBounds){
              users[key] = {};
              users[key].bounds = $scope.userBounds[key];
              users[key].color = Users.getUserById(key).color;
            }
            MapHandler.paintAllUserBounds(users);
          };

          /**
           * Watch all users
           */
          $scope.isWatchingAll = false;
          $scope.watchAll = function() {
            $scope.isWatchingAll = !$scope.isWatchingAll;
          };

          /**
           * Pans to a selcted featured
           * @param {String} id feature id
           */
          $scope.panToFeature = function(id) {
            MapHandler.panToFeature(id);
            MapHandler.highlightFeatureId(id);
          };

          /**
           * Highlights the user Button if a chat message comes in and the user tab is not opened
           */

          function highlightOnChatMessage() {
            $scope.$on('chatmessage', function() {
              if ($scope.views.userView) {
                var elem = elements.children()[0].children[0];
                var className = elem.className;
                if (className.indexOf('orangeBackground') < 0) {
                  className += ' orangeBackground';
                }
                elem.className = className;
              }
            });

            $scope.$on('toolbox', function(e, event) {
              if (event === 'userView') {
                var elem = elements.children()[0].children[0];
                var className = elem.className;
                if (className.indexOf('orangeBackground') > -1) {
                  elem.className = className.replace(' orangeBackground', '');
                }
              }
            });
          }

          highlightOnChatMessage();


        }
      };
    }
  ]);
