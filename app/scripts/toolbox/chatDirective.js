'use strict';

angular.module('CollaborativeMap')
  .directive('chat', ['Socket',
    function(Socket) {


      return {
        templateUrl: 'partials/chat',
        restrict: 'E',
        link: function postLink($scope) {
          $scope.messages = [];
          var mapId = $scope.mapId;
          var userName = $scope.userName;

          function sendMessage(message) {
            message = {
              'message': message,
              'user': userName,
              'mapId': mapId
            };
            Socket.emit('chat', message, function(res) {
              console.log(res);
            });
          }

          function receiveMessage() {
            Socket.on(mapId + '-chat', function(res) {
              $scope.messages.push(res);
              console.log(res);
            });
          }

          receiveMessage();

          $scope.sendMessage = function() {
            if ($scope.chatMessage) {
              var message = $scope.chatMessage;
              $scope.chatMessage = '';
              console.log('Send', message);
              sendMessage(message);
            }
          };

        }
      };
    }
  ]);
