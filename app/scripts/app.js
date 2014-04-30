'use strict';

angular.module('CollaborativeMap', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'SocketModule'
])
  .config(function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'partials/start',
        controller: 'StartCtrl'
      })
      .when('/tester', {
        templateUrl: 'partials/tester',
        controller: 'TesterCtrl'
      })
      .when('/map/:mapid', {
        templateUrl: 'partials/main',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'partials/about',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
  });

angular.module('SocketModule', []);
