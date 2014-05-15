'use strict';

/**
 * @memberof CollaborativeMap
 * @fileOverview Chat directive. Provides the GUI functionality as well as the WebSocket connection for the chat.
 * @exports CollaborativeMap.chat
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap')
  .directive('chatMessage', ['MapHandler', '$compile',
    function(MapHandler, $compile) {
      return {
        template: '<div></div>',
        restrict: 'E',
        scope: {
          message: '='
        },
        link: function postLink(scope, element) {

          function exchangeFid() {
            var index = message.indexOf('#');
            if (index > -1) {
              var fidString = message.substring(index).split(' ')[0];
              message = createButton(fidString);
            }
            if (message.indexOf('#') > -1) {
              exchangeFid();
            }
          }

          function createButton(fidString) {
            return message.replace(fidString, '<span class="featureInChat" ng-click="panToFeature(\'' + fidString.substring(1) + '\')">Feature</span>');
          }

          scope.panToFeature = function(fid) {
            MapHandler.panToFeature(fid);
            MapHandler.highlightFeatureId(fid);
          };

          var message = '';
          if (scope.message && scope.message.message) {
            message = scope.message.message;
          }

          exchangeFid(message);
          element[0].innerHTML = message;
          var e = angular.element(element[0]);
          $compile(e.contents())(scope);

        }
      };
    }
  ]);
