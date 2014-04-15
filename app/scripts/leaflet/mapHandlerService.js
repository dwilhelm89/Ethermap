'use strict';

angular.module('CollaborativeMap')
  .service('MapHandler', ['Utils',
      function(Utils) {

        var map;

        return {

          initMapHandler: function(m) {
            //patch L.stamp to get unique layer ids
            Utils.patchLStamp();

            map = m;
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

          panToFeature: function(id) {
            var target = map._layers[id];

            if (target._latlng) {
              map.panTo(target._latlng);
            } else if (target._latlngs) {
              var bounds = target.getBounds();
              map.fitBounds(bounds);
            }
          }

        };
      }]);
