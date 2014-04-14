'use strict';

angular.module('CollaborativeMap')
  .directive('map', ['$http',
    function($http) {


      function addGeoJSONFeature(map, feature, drawnItems) {
        //jshint camelcase:false
        var newLayer = L.geoJson(feature);
        var tmpLayer;
        for (var key in newLayer._layers) {
          tmpLayer = newLayer._layers[key];
          tmpLayer._leaflet_id = feature._id;
          tmpLayer.addTo(drawnItems);
        }
      }

      function loadFeatures(http, mapId, map, drawnItems) {
        http({
          method: 'GET',
          url: '/api/features/' + mapId
        })
          .success(function(data) { //, status, headers, config) {
            if (data.rows) {
              data.rows.forEach(function(row) {
                addGeoJSONFeature(map, row.doc, drawnItems);
              });
            }

          })
          .error(function(data) { //, status, headers, config) {
            console.log(data);
          });
      }


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
          L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png')
            .addTo(map);

          map.addControl(L.mapbox.infoControl({
            position: 'bottomleft'
          }).addInfo('&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'));

          // Initialise the FeatureGroup to store editable layers
          var drawnItems = $scope.drawnItems = new L.FeatureGroup();
          map.addLayer(drawnItems);

          // Initialise the draw control and pass it the FeatureGroup of editable layers
          var drawControl = new L.Control.Draw({
            edit: {
              featureGroup: drawnItems
            },
            draw: {
              circle: false,
              rectangle: false
            }
          });
          map.addControl(drawControl);

          map.on('draw:created', function(e) {
            drawnItems.addLayer(e.layer);
          });


          loadFeatures($http, $scope.mapId, map, drawnItems);

          $scope.onMapReady();
        }
      };
    }
  ]);
