'use strict';

describe('Directive: chat', function () {

  // load the directive's module
  beforeEach(module('collaborativeMapApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<chat></chat>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the chat directive');
  }));
});
