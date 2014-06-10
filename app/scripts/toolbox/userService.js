'use strict';
angular.module('CollaborativeMap').service('Users', [
  function() {

    var users = {};
    console.log('users');

    return {

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

      getUserById: function(key) {
        return users[key];
      },

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
