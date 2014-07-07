'use strict';

/**
 * @memberof CollaborativeMap
 * @fileOverview Leaflet map directive.
 * Initializes the map.
 * Loads already existing features from the Database.
 * Initializes the map Synchronization and the MapHandler
 * @exports CollaborativeMap.MapDirective
 * @requires  $http
 * @requires MapHandler
 * @requires SynchronizeMap
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap')
  .directive('map', ['MapHandler', 'SynchronizeMap',
    function(MapHandler, SynchronizeMap) {
      var mapLoadingDiv;

      /**
       * Load the features for the current map from the database
       * @param  {String} mapId      the map id
       * @param  {Object} map        the map
       * @param  {Object} drawnItems layer group for the drawn items
       */

      function loadFeatures(mapId, map, drawnItems) {
        showLoading();
        oboe('/api/features/' + mapId)
          .node('rows.*', function(row) {

            // This callback will be called everytime a new object is
            // found in the foods array.
            MapHandler.addGeoJSONFeature(map, {
              'feature': row.doc,
              'fid': row.doc._id
            }, drawnItems);
          })
          .done(function() {
            removeLoading();
          });
      }

      /**
       * Creates a loading div
       */

      function showLoading() {
        mapLoadingDiv = document.createElement('div');
        mapLoadingDiv.className = 'mapLoading';
        var loading = document.createElement('div');
        loading.className = 'loading';
        mapLoadingDiv.appendChild(loading);
        document.body.appendChild(mapLoadingDiv);
      }

      /**
       * Removes the loading div from the page
       */

      function removeLoading() {
        document.body.removeChild(mapLoadingDiv);
      }


      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        template: '<div id="map"></div>',
        replace: true,
        scope: {
          mapId: '=mapid'
        },
        // transclude: true,
        link: function postLink($scope) {

          //expose map for debugging purposes
          //var map = window._map = L.mapbox.map('map', 'dnns.h8dkb1bh');
          var map = window._map = L.mapbox.map('map')
            .setView([51.08921076570122, 13.625020980834961], 12);


          var mapLink = '<a href="http://www.esri.com/">Esri</a>';
          var wholink = 'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

          var aerial = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(map);

          var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');

          var water = L.tileLayer.wms('https://geodienste.sachsen.de/wms_geosn_dopsb2013/guest', {
            format: 'image/png',
            transparent: true,
            opacity: 0.8,
            layers: '1'
          }).addTo(map);



          map.addControl(L.mapbox.infoControl({
              position: 'bottomleft'
            })
            .addInfo('&copy; ' + mapLink + ', ' + wholink));


          //User study area:
          L.geoJson({
            'type': 'Feature',
            'properties': {},
            'geometry': {
              'type': 'Polygon',
              'coordinates': [
                [
                  [13.547515869140623, 51.04819321568309],
                  [13.547515869140623, 51.131753979785934],
                  [13.70767593383789, 51.131753979785934],
                  [13.70767593383789, 51.04819321568309],
                  [13.547515869140623, 51.04819321568309]
                ]
              ]
            }
          }, {
            'color': '#00FF00',
            'weight': 3,
            'fill': false
          }).addTo(map);

          map.setMaxBounds([
            [50.99841640882189, 13.468551635742186],
            [51.16556659836182, 13.803634643554688]
          ]);
          map._layersMinZoom = 12;


          // Initialise the FeatureGroup to store editable layers
          var drawnItems = window.drawnItems = new L.FeatureGroup();
          map.addLayer(drawnItems);

          L.control.layers({
            'Aerial': aerial,
            'OpenStreetMap': osm
          }, {
            'Floodings': water,
            'Drawn Items': drawnItems
          }, {
            position: 'topleft'
          }).addTo(map);

          // Initialise the draw control and pass it the FeatureGroup of editable layers
          var drawControl = window._drawControl = new L.Control.Draw({
            edit: false,
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

          L.drawLocal.edit.handlers.edit.tooltip.subtext = 'Click "Stop Editing" to stop the edit mode';

          //Drawn features have to be added to the layer group
          map.on('draw:created', function(e) {
            drawnItems.addLayer(e.layer);
            MapHandler.editFeature(e.layer);
          });

          //Out of some unknown reasons the leaflet.draw tooltips where deactivated
          map.options.drawControlTooltips = true;

          //Load already existing features from the db
          loadFeatures($scope.mapId, map, drawnItems);

          //Initialize the MapHandler (wrapper for all map based actions)
          MapHandler.initMapHandler(map, drawnItems, $scope.$parent, drawControl);

          //Initialize the map synchronization (handles all Websocket related sync stuff)
          SynchronizeMap.init(map, $scope.$parent, drawnItems);

        }
      };
    }
  ]);
