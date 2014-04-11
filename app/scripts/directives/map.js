'use strict';

angular.module('CollaborativeMap').directive('map', [
  function() {
    return {
      restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
      template: '<div id="map"></div>',
      // templateUrl: '',
      replace: true,
      // transclude: true,
      // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
      link: function postLink($scope) {

        //expose map for debugging purposes
        //var map = window._map = L.mapbox.map('map', 'dnns.h8dkb1bh');
        var map = $scope.map = window._map = L.mapbox.map('map')
          .setView([51.95, 7.62], 13);

        // add an OpenStreetMap tile layer
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
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
