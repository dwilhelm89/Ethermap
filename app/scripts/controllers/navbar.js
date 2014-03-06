'use strict';

angular.module('CollaborativeMap')
    .controller('NavbarCtrl', function($scope, $location) {
        $scope.menu = [{
            'title': 'Home',
            'link': '/'
          }, {
            'title': 'About',
            'link': '/about'
          }];

        $scope.isActive = function(route) {
            return route === $location.path();
          };
      });
