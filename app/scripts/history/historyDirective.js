'use strict';

angular.module('CollaborativeMap')
.directive('history', ['$http', function($http){

	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		// scope: {}, // {} = isolate, true = child, false/undefined = no change
		// controller: function($scope, $element, $attrs, $transclude) {},
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		templateUrl: 'partials/history',
		replace: true,
		// replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs, controller) {
			var visible = false;


			function loadHistory(fid){
				console.log('load history', fid);
			}

			$scope.toggleHistoryModal= function(fid){
				visible = !visible;
				$('#historyModal').modal('toggle');
				if(visible){
					loadHistory(fid);
				}
			};
		}
	};
}]);