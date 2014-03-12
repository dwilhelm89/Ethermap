'use strict';

angular.module('CollaborativeMap')
  .controller('MainCtrl', ['$scope', '$rootScope', '$routeParams', 'SynchronizeMap', 'Utils',
    function($scope, $rootScope, $routeParams, SynchronizeMap, Utils) {

      function initLeafletDraw() {
        // Initialise the FeatureGroup to store editable layers
        var drawnItems = new L.FeatureGroup();
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

        return drawnItems;
      }

      $scope.views = {
        userView: true,
        historyView: true,
        toolBarIn: true
      };
      $scope.toggleToolbar = function(view) {
        var vs = $scope.views;
        if(vs.toolBarIn){
          vs.toolBarIn = false;
          vs[view] = false;
        }else if(!vs[view]){
          hideAllViews();
        }else{
          hideAllViews();
          vs.toolBarIn = false;
          vs[view] = false;
        }
      };

      function hideAllViews(){
        var vs = $scope.views;
        for(var key in vs){
          vs[key] = true;
        }
      }



      $scope.watchUsers = {};
      $scope.watchUser = function(userId) {
        if ($scope.watchUsers[userId]) {
          delete $scope.watchUsers[userId];
        }else{
          $scope.watchUsers[userId] = true;
        }
      };

      $scope.isWatchingAll = false;
      $scope.watchAll = function(){
        $scope.isWatchingAll = !$scope.isWatchingAll;
      };

      $scope.userName = $rootScope.userName = $rootScope.userName || 'unnamed';

      //TODO: random map id generator
      $scope.mapId = $routeParams.mapid;

      //patch L.stamp to get unique layer ids
      Utils.patchLStamp();

      //expose map for debugging purposes
      //var map = window._map = L.mapbox.map('map', 'dnns.h8dkb1bh');
      var map = window._map = L.mapbox.map('map')
        .setView([51.95, 7.62], 13);

      // add an OpenStreetMap tile layer
      L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.png', {
        attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.'
      })
        .addTo(map);

      var drawnItems = initLeafletDraw();


      SynchronizeMap.init(map, $scope, drawnItems);



    }
  ]);
