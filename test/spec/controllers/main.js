'use strict';

describe('Controller: MainCtrl', function() {

  // load the controller's module
  beforeEach(module('CollaborativeMap'));

  var MainCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function($controller, $rootScope) {
    localStorage.setItem('cm-user', 'test');
    scope = $rootScope.$new();
    MainCtrl = $controller('MainCtrl', {
      $scope: scope,
      $rootScope: {},
      $routeParams: {
        mapid: 'testmap'
      },
      TesterService: function() {}
    });
  }));

  it('user name is "test"', function() {
    expect(scope.userName).toEqual('test');
  });

});
