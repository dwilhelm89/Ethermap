'use strict';

describe('Controller: NeuercontrollerCtrl', function () {

  // load the controller's module
  beforeEach(module('CollaborativeMap'));

  var NeuercontrollerCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    NeuercontrollerCtrl = $controller('NeuercontrollerCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});
