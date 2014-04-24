'use strict';

angular.module('CollaborativeMap')
  .service('MapHandler', ['Utils', 'Socket',
    function(Utils, Socket) {

      var map, drawnItems, mapScope;

      return {

        initMapHandler: function(m, dI, scope) {
          //patch L.stamp to get unique layer ids
          Utils.patchLStamp();

          map = m;
          drawnItems = dI;
          mapScope = scope;
        },

        updateFeature: function(layer) {
          this.removeLayer(map, layer, drawnItems);
          this.addGeoJSONFeature(map, layer, drawnItems);
          map.fireEvent('propertyEdited', {
            'layer': layer.feature,
            'fid': layer.fid
          });
        },

        addClickEvent: function(layer) {
          layer.on('click', function() {
            mapScope.selectFeature(layer);
          });
        },

        paintUserBounds: function(bounds) {
          var bound = L.rectangle(bounds, {
            color: '#ff0000',
            weight: 1,
            fill: false
          });
          bound.addTo(map);
          map.fitBounds(bound, {
            'padding': [5, 5]
          });
          setTimeout(function() {
            map.removeLayer(bound);
          }, 3000);
        },

        revertFeature: function(mapId, fid, toRev, user) {
          Socket.emit('revertFeature', {
            'mapId': mapId,
            'fid': fid,
            'toRev': toRev,
            'user': user
          }, function(res) {
            console.log(res);
          });
        },

        panToFeature: function(id) {
          var target = map._layers[id];

          if (target._latlng) {
            map.panTo(target._latlng);
          } else if (target._latlngs) {
            var bounds = target.getBounds();
            map.fitBounds(bounds);
          }
        },

        addGeoJSONFeature: function(map, event, drawnItems) {
          //jshint camelcase:false
          var newLayer = L.geoJson(event.feature, {
            style: L.mapbox.simplestyle.style,
            pointToLayer: function(feature, latlon) {
              if (!feature.properties) {
                feature.properties = {};
              }
              return L.mapbox.marker.style(feature, latlon);
            }
          });
          var tmpLayer;
          for (var key in newLayer._layers) {
            tmpLayer = newLayer._layers[key];
            tmpLayer._leaflet_id = event.fid;
            this.addClickEvent(tmpLayer);
            tmpLayer.addTo(drawnItems);
          }
        },

        removeLayer: function(map, event, drawnItems) {
          var deleteLayer = map._layers[event.fid];
          if (deleteLayer) {
            map.removeLayer(deleteLayer);
            drawnItems.removeLayer(deleteLayer);
          }
        }

      };
    }
  ]);
