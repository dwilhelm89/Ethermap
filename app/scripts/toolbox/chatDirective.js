'use strict';

/**
 * @memberof CollaborativeMap
 * @fileOverview Chat directive. Provides the GUI functionality as well as the WebSocket connection for the chat.
 * @exports CollaborativeMap.chat
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap')
  .directive('chat', ['Socket',
    function(Socket) {


      return {
        templateUrl: 'partials/chat',
        restrict: 'E',
        scope: {},
        link: function postLink($scope) {
          $scope.messages = window.a = [];
          var mapId = $scope.$parent.mapId;
          var userName = $scope.$parent.userName;

          /**
          * Send a message via Websockets
          * @param {String} message the chat message
          */
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

          /**
          * Connects to the WebSocket stream. 
          * Retrieved messages are pushed to the messages array which is used in the ng-repeat
          */
          function receiveMessage() {
            Socket.on(mapId + '-chat', function(res) {
              $scope.$root.$broadcast('chatmessage');
              $scope.messages.push(res);
              setTimeout(scrollDown, 100);
            });
          }

          receiveMessage();

          /**
           * Scroll down the chatmessages to the bottom
           */
          function scrollDown(){
            var elem = $('.chatMessages')[0];
            if(elem){
              elem.scrollTop = elem.scrollHeight;
            }
          }

          /**
          * Send a chat message. Called via the Send button or by pressing enter in the GUI
          * @param {Number} key key code 
          */
          $scope.sendMessage = function(key) {
            var send = function(){
              var message = $scope.chatMessage;
              $scope.chatMessage = '';
              sendMessage(message);
            };

            if ($scope.chatMessage) {
              if( key && key.keyCode === 13){
                send();
              }else if(!key){
                send();
              }
            }
          };

        }
      };
    }
  ]);
