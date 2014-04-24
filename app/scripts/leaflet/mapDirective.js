'use strict';

angular.module('CollaborativeMap')
  .directive('map', ['$http', 'MapHandler', 'SynchronizeMap',
    function($http, MapHandler, SynchronizeMap) {

      function loadFeatures(http, mapId, map, drawnItems) {
        http({
          method: 'GET',
          url: '/api/features/' + mapId
        })
          .success(function(data) { //, status, headers, config) {
            if (data.rows) {
              data.rows.forEach(function(row) {
                MapHandler.addGeoJSONFeature(map, {
                  'feature': row.doc,
                  'fid': row.doc._id
                }, drawnItems);
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
          var map = window._map = L.mapbox.map('map')
            .setView([51.95, 7.62], 13);

          // add an OpenStreetMap tile layer
          //         L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png')
          //            .addTo(map);
          L.tileLayer('http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png').addTo(map);

          map.addControl(L.mapbox.infoControl({
              position: 'bottomleft'
            })
            .addInfo('&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'));

          // Initialise the FeatureGroup to store editable layers
          var drawnItems = new L.FeatureGroup();
          map.addLayer(drawnItems);

          // Initialise the draw control and pass it the FeatureGroup of editable layers
          var drawControl = new L.Control.Draw({
            edit: {
              featureGroup: drawnItems
            },
            draw: {
              circle: false,
              rectangle: false,
              marker: {
                icon: L.mapbox.marker.icon({})
              },
              polyline: {
                shapeOptions: {
                  color: '#555555',
                  fillOpacity: 0.5,
                  weight: 2,
                  opacity: 1
                }
              },
              polygon: {
                shapeOptions: {
                  color: '#555555',
                  fillOpacity: 0.5,
                  weight: 2,
                  opacity: 1
                }
              }
            }
          });
          map.addControl(drawControl);

          map.on('draw:created', function(e) {
            drawnItems.addLayer(e.layer);
          });

          map.options.drawControlTooltips = true;

          loadFeatures($http, $scope.mapId, map, drawnItems);

          MapHandler.initMapHandler(map, drawnItems, $scope);
          SynchronizeMap.init(map, $scope, drawnItems);

        }
      };
    }
  ]);
