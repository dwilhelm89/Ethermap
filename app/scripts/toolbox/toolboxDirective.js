'use strict';

angular.module('CollaborativeMap')
  .directive('toolbox', ['$http', '$compile', 'MapHandler',
    function($http, $compile, MapHandler) {
      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        templateUrl: 'partials/toolbox',
        replace: true,

        link: function postLink($scope) {

          function setUpIntroJS() {
            var drawFeatures = document.getElementsByClassName('leaflet-draw-toolbar leaflet-bar')[0];
            drawFeatures.setAttribute('data-intro', 'These are the drawing tools. They can be used to create markers, lines and polygons.');

            var editFeature = document.getElementsByClassName('leaflet-draw-toolbar leaflet-bar')[1];
            editFeature.setAttribute('data-intro', 'Click here to edit/delete the geometry of features. Click on a feature in the map to edit it\'s properties');
          }

          $scope.startIntroJS = function() {
            setUpIntroJS();
            /*global introJs */
            introJs().start();
          };

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

          $scope.userBounds = {};

          $scope.getUserBounds = function(userId) {
            var bounds = $scope.userBounds[userId];
            if (bounds) {
              MapHandler.paintUserBounds(bounds);
            }else{
              window.alert('The user hasn\'t mooved since you logged in');
            }
          };

          $scope.isWatchingAll = false;
          $scope.watchAll = function() {
            $scope.isWatchingAll = !$scope.isWatchingAll;
          };


          $scope.loadHistory = function() {
            $http({
              method: 'GET',
              url: '/api/history/' + $scope.mapId
            })
              .
            success(function(data) { //, status, headers, config) {
              data.forEach(function(action) {
                if (action.date) {
                  var tmpDate = new Date(action.date);
                  action.dateString = tmpDate.getHours() + ':' +
                    tmpDate.getMinutes() + ':' + tmpDate.getSeconds() +
                    ' - ' + tmpDate.getDate() + '.' +
                    (tmpDate.getMonth() + 1) + '.' +
                    tmpDate.getFullYear();

                }
              });
              $scope.history = data;

            })
              .
            error(function(data) { //, status, headers, config) {
              console.log(data);
            });

          };

          $scope.showFeatureHistory = function(id) {
            $scope.toggleHistoryModal(id);
          };

          $scope.panToFeature = function(id) {
            MapHandler.panToFeature(id);
          };

        }
      };
    }
  ]);
