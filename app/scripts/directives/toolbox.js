'use strict';

angular.module('CollaborativeMap').
directive('toolbox', [
  function() {
    return {
      restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
      template: '<div class="toolbox-buttons">    <input type="button" class="btn btn-default btn-green noLeftBorder" ng-click="toggleToolbar(\'userView\')" value="Users">    <input type="button" class="btn btn-default btn-green noLeftBorder" ng-click="toggleToolbar(\'historyView\')" value="History">    <input type="button" class="btn btn-default btn-green noLeftBorder" ng-click="toggleToolbar(\'toolsView\')" value="Tools">    <input type="button" class="btn btn-default btn-green noLeftBorder" ng-click="toggleToolbar(\'settingsView\')" value="Settings"><div class="toolbox animate-slideIn" ng-class="{\'zeroWidth\':views.toolBarIn}"><div class="toolbox-content" ng-class="{\'hide\': views.userView}"><input type="button" class="btn btn-default" ng-class="{\'watching\': isWatchingAll}" ng-click="watchAll()" value="Watch all"><div ng-repeat="(key, value) in users"><div><input type="button" class="btn btn-default" ng-class="{\'watching\': watchUsers[key]}" ng-click="watchUser(key)" value="watch"><span ng-click="getUserBounds(key)">{{value}}</span></div></div></div><div class="toolbox-content" ng-class="{\'hide\': views.historyView}">History</div><div class="toolbox-content" ng-class="{\'hide\': views.toolsView}">Tools</div><div class="toolbox-content" ng-class="{\'hide\': views.settingsView}">Settings</div></div>',
      //templateUrl: '../../views/directives/toolbox.html',
      replace: true,

      link: function($scope) {
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
        };

        function hideAllViews() {
          var vs = $scope.views;
          for (var key in vs) {
            vs[key] = true;
          }
        }

        $scope.watchUsers = {};
        $scope.watchUser = function(userId) {
          if ($scope.watchUsers[userId]) {
            delete $scope.watchUsers[userId];
          } else {
            $scope.watchUsers[userId] = true;
          }
        };

        $scope.userBounds = {};

        $scope.getUserBounds = function(userId) {
          console.log(userId);
          var bounds = $scope.userBounds[userId];
          if (bounds) {
            var bound = L.rectangle(bounds, {
              color: '#ff0000',
              weight: 1,
              fill: false
            });
            bound.addTo($scope.map);
            $scope.map.fitBounds(bound, {
              'padding': [5, 5]
            });
            setTimeout(function() {
              $scope.map.removeLayer(bound);
            }, 3000);
          }
        };

        $scope.isWatchingAll = false;
        $scope.watchAll = function() {
          $scope.isWatchingAll = !$scope.isWatchingAll;
        };
      }
    };
  }
]);
