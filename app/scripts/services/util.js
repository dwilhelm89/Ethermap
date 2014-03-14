'use strict';

angular.module('CollaborativeMap').
  factory('Utils', function() {
    return {

      c: 1,

      createId: function() {
        var d = new Date();
        var m = d.getMilliseconds() + '';
        var u = ++d + m + (++this.c === 10000 ? (this.c = 1) : this.c);

        return u;
      },

      //patch the stamp method to get unique ids for all layers
      patchLStamp: function() {
          L.stamp = function(obj) {
            // jshint camelcase: false
            obj._leaflet_id = obj._leaflet_id || this.createId();
            return obj._leaflet_id;
          }.bind(this);
        }

    };
  });
