'use strict';

angular.module('CollaborativeMap')
  .directive('featureproperties', ['$compile','MapHandler',
    function($compile, MapHandler) {




      return {
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        //template: '<div>test</div>',
        templateUrl: 'partials/featureproperties',
        replace: true,
        link: function postLink($scope) {

          function activateToolbox() {
            if ($scope.views.toolBarIn) {
              $scope.toggleToolbar('toolsView');
            } else if ($scope.views.toolsView) {
              $scope.toggleToolbar('toolsView');
            }
            //recompile already created template (toolbox)
            $compile($('#toolbox'))($scope);
          }

          //called from the feature onClick through the map services
          $scope.selectFeature = function(feature) {
            //jshint camelcase:false
            activateToolbox();
            $scope.selectedFeature = {
              'feature': feature.toGeoJSON(),
              'fid': feature._leaflet_id
            };
          };

          function updateFeature(){
            MapHandler.updateFeature($scope.selectedFeature);
          }

        }
      };
    }
  ]);
