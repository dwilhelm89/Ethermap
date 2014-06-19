'use strict';
/**
 * @memberof CollaborativeMap
 * @fileOverview Provides functions for different API requests.
 * Methods exist for: map history, feature history, preset data, and map features
 * @exports CollaborativeMap.ApiService
 *
 * @requires $http
 * @requires $q
 *
 * @author Dennis Wilhelm
 */
angular.module('CollaborativeMap')
  .service('ApiService', ['$http', '$q',
    function($http, $q) {

      return {

        /**
         * Returns a promise which will be resolved current features of the map
         * @param  {String} mapId the map id
         * @return {Function} Promise of the http request
         */
        getFeatures: function(mapId) {
          return $http.get('/api/features/' + mapId);
        },

        /**
         * Returns an oboe promise which will be resolved current features of the map.
         * Can be used to handle intermediary results of the http request.
         * Especially useful when loading larger amount of features as one doesn't have to wait
         * until the request is finished.
         * @param  {String} mapId the map id
         * @return {Function} Promise of the http request
         */
        getFeaturesOboe: function(mapId) {
          return oboe('/api/features/' + mapId);
        },


        /**
         * Returns a promise which will be resolved with the history of a specific feature
         * @param  {String} mapId the map id
         * @param  {String} fid   the feature id
         * @return {Function} Promise of the http request
         */
        getFeatureHistory: function(mapId, fid) {
          return $http.get('/api/documentRevisions/' + mapId + '/' + fid);
        },

        /**
         * Request the current map history. Returns a promise with the http request.
         * @param  {String} mapId the map id
         * @return {Function}       Promise of the http request
         */
        getMapHistory: function(mapId) {
          return $http.get('api/history/' + mapId);
        },

        /**
         * Loads the presets for the feature categories and fields from the server. Returns a promise.
         * @return {Function} Promise of the http request
         */
        getPresetData: function() {
          var categoriesPromise = $http.get('presets/categories'),
            fieldsPromise = $http.get('presets/fields'),
            presetsPromise = $http.get('presets/presets');

          return $q.all([categoriesPromise, fieldsPromise, presetsPromise]).then(function(resultArray) {
            var categories, fields, presets;
            if (resultArray) {
              if (resultArray[0] && resultArray[0].data) {
                categories = resultArray[0].data;
              }
              if (resultArray[1] && resultArray[1].data) {
                fields = resultArray[1].data;
              }
              if (resultArray[2] && resultArray[2].data) {
                presets = resultArray[2].data;
              }
            }
            return [categories, fields, presets];
          });


        }

      };
    }
  ]);
