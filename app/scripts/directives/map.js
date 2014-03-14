'use strict';

angular.module('CollaborativeMap').
directive('map', [
  function() {
    // Runs during compile
    return {
      // name: '',
      // priority: 1,
      // terminal: true,
      // scope: {}, // {} = isolate, true = child, false/undefined = no change
      // controller: function($scope, $element, $attrs, $transclude) {},
      // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
      restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
      template: '<div id="map"></div>',
      // templateUrl: '',
      replace: true,
      // transclude: true,
      // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
      link: function($scope) {
        console.log($scope);

        //expose map for debugging purposes
        //var map = window._map = L.mapbox.map('map', 'dnns.h8dkb1bh');
        var map = $scope.map = window._map = L.mapbox.map('map')
          .setView([51.95, 7.62], 13);

        // add an OpenStreetMap tile layer
        L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
          attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
        }).addTo(map);

        // Initialise the FeatureGroup to store editable layers
        var drawnItems = $scope.drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        // Initialise the draw control and pass it the FeatureGroup of editable layers
        var drawControl = new L.Control.Draw({
          edit: {
            featureGroup: drawnItems
          },
          draw: {
            circle: false
          }
        });
        map.addControl(drawControl);

        map.on('draw:created', function(e) {
          drawnItems.addLayer(e.layer);
        });

        $scope.onMapReady();
      }
    };
  }
]);
