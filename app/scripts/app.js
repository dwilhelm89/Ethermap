'use strict';

/**
 * @fileOverview Initializes the CollaborativeMap module
 * @author Dennis Wilhelm
 * @namespace CollaborativeMap
 */
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

/**
 * Add helper function "safeApply" to the rootscope, so we
 * can safely trigger $apply from external (leaflet) events.
 * https://github.com/angular/angular.js/issues/2023
 */
angular.module('ng').run(function($rootScope) {
  $rootScope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase == '$apply' || phase == '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };
});
