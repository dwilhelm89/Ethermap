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
            this.highlightFeature(layer);
          }.bind(this));
        },

        fitBounds: function(bounds){
          map.fitBounds(bounds);
        },

        getBounds: function(nE, sW){
          return new L.LatLngBounds(nE, sW);
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

        restoreDeletedFeature: function(mapId, fid, feature, user) {
          Socket.emit('restoreDeletedFeature', {
            'mapId': mapId,
            'fid': fid,
            'feature': feature,
            'action': 'restored',
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

        /**
         * Creates Leaflet geojson layers with the Mapbox SimpleStyle specification
         * @param  {Object} geojson feature
         * @return {Object} leaflet layer
         */
        createSimpleStyleGeoJSONFeature: function(geoJsonFeature){
          return L.geoJson(geoJsonFeature, {
            style: L.mapbox.simplestyle.style,
            pointToLayer: function(feature, latlon) {
              if (!feature.properties) {
                feature.properties = {};
              }
              return L.mapbox.marker.style(feature, latlon);
            }
          });
        },

        /**
         * Adds GeoJSON encoded features to the map
         * @param {Object} map
         * @param {Object} event = {feature, fid //feature id}
         * @param {Object} drawnItems = layer group
         */
        addGeoJSONFeature: function(map, event, drawnItems) {
          //jshint camelcase:false
          var newLayer = this.createSimpleStyleGeoJSONFeature(event.feature);
          var tmpLayer;
          for (var key in newLayer._layers) {
            tmpLayer = newLayer._layers[key];
            tmpLayer._leaflet_id = event.fid;
            this.addClickEvent(tmpLayer);
            tmpLayer.addTo(drawnItems);
            //If action is available (edit, create, delete) highight the feature
            if (event.action) {
              this.highlightFeature(tmpLayer);
            }
          }
        },

        //Highlights a feature for a few seconds (differentation between svgs and html elements)
        highlightFeature: function(feature) {
          if (feature) {
            var elem = feature._icon || feature._container.children[0];
            var tmpClass = elem.getAttribute('class');
            elem.setAttribute('class', tmpClass + 'animateAll');
            setTimeout(function() {
              elem.setAttribute('class', tmpClass + ' highlight');
            }, 50);

            setTimeout(function() {
              elem.setAttribute('class', tmpClass + ' animateAll');
              setTimeout(function() {
                elem.setAttribute('class', tmpClass);
              }, 1000);
            }, 1000);
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
