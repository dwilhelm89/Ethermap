'use strict';

/**
 * @memberof CollaborativeMap
 * @fileOverview Util factory.
 * @exports CollaborativeMap.MapHandler
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap').
  factory('Utils', function() {
    return {

      c: 1,
      /**
       * Create ids based on the date
       * @return {String} new id
       */
      createId: function() {
        var d = new Date();
        var m = d.getMilliseconds() + '';
        var u = ++d + m + (++this.c === 10000 ? (this.c = 1) : this.c);

        return u;
      },

      /**
       * Overrides leaflets id function to create more unique ids.
       */
      patchLStamp: function() {
          L.stamp = function(obj) {
            // jshint camelcase: false
            obj._leaflet_id = obj._leaflet_id || this.createId();
            return obj._leaflet_id;
          }.bind(this);
        }

    };
  });
