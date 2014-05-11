'use strict';

/**
 * @memberof SocketModule
 * @fileOverview Listens to the socketIO events to display a message if the connection is lost or established.
 *
 * @exports SocketModule.socketStatus
 *
 * @author Dennis Wilhelm
 */
angular.module('SocketModule').directive('socketStatus', [
  function() {

    return {
      restrict: 'E',
      template: '<div ng-show="showStatus" class="socketStatus" ng-class="statusClass"></div>',
      replace: true,
      scope: {},
      link: function(scope, element) {

        scope.showStatus = false;

        /**
         * Displays a message if the socketIO connection is established.
         * The message will be hidden after 3 seconds
         */
        scope.$on('socketio-connected', function() {
          element[0].innerHTML = 'Connected successfully...';
          scope.showStatus = true;
          scope.statusClass = 'greenBackground';
          scope.$apply();
          setTimeout(function() {
            scope.showStatus = false;
            scope.$apply();
          }, 3000);
        });

        /**
         * Displays a message if the socketIO connection is lost.
         */
        scope.$on('socketio-disconnected', function() {
          element[0].innerHTML = 'Connected lost. Reconnecting...';
          scope.showStatus = true;
          scope.statusClass = '';
          scope.$apply();
        });

      }
    };

  }
]);
