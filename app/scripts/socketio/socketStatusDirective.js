'use strict';
angular.module('SocketModule').directive('socketStatus', [
  function() {

    return {
      restrict: 'E',
      template: '<div ng-show="showStatus" class="socketStatus" ng-class="statusClass"></div>',
      replace: true,
      scope: {},
      link: function(scope, element) {

        scope.showStatus = false;

        scope.$on('socketio-connected', function() {
          console.log('connected');
          element[0].innerText = 'Connected successfully...';
          scope.showStatus = true;
          scope.statusClass = 'greenBackground';
          scope.$apply();
          setTimeout(function() {
            scope.showStatus = false;
            scope.$apply();
          }, 3000);
        });

        scope.$on('socketio-disconnected', function() {
          console.log('disconnected');
          element[0].innerText = 'Connected lost. Reconnecting...';
          scope.showStatus = true;
          scope.statusClass = '';
          scope.$apply();
        });

      }
    };

  }
]);
