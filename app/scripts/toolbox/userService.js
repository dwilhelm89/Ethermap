'use strict';

/**
 * @memberof CollaborativeMap
 * @fileOverview Stores the users currently within the map with their WebSockt ID and user name
 * Creates a randomColor for every user. 
 * Provides getters for the userName and the userColor
 * @exports CollaborativeMap.Users
 * @author Dennis Wilhelm
 */

angular.module('CollaborativeMap')
  .service('Users', [
    function() {

      var users = {};

      return {

        /**
         * Stores the users within the map and creates a random color for everyone.
         * If a user is alredy existing, don't create a new color. 
         * Supposed to be called by the SynchronizeMapService
         * @param  {Object} newUsers {socketId: name}
         * @return {Object}          user object with colors {socketId:{name, color}}
         */
        receiveUsers: function(newUsers) {
          if (newUsers) {
            var tmpUsers = {};
            for (var key in newUsers) {

              if (users[key]) {
                tmpUsers[key] = users[key];
              } else {
                tmpUsers[key] = {
                  name: newUsers[key],
                  color: randomColor()
                };
              }
            }
            users = tmpUsers;
          }
          return users;
        },

        /**
         * Return the user based on the socketID
         * @param  {String} key socket id
         * @return {Object}     user object {color, name}
         */
        getUserById: function(key) {
          return users[key];
        },

        /**
         * Return the color of a user based on the user name
         * @param  {String} name user name
         * @return {String}      hex color value
         */
        getUserColorByName: function(name) {
          for (var key in users) {
            if (users[key].name === name) {
              return users[key].color;
            }
          }
        }



      };
    }
  ]);
