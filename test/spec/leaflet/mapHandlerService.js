'use strict';

var io = {
  emit: function() {},
  on: function() {}
};

describe('Service: MapHandler', function() {

  var MapHandlerService;

  // load the service's module
  beforeEach(function() {
    module('CollaborativeMap');

    inject(function(MapHandler) {
      MapHandlerServiceService = MapHandler;
    });

    it('MapHandler is defined', function(){
      expect(MapHandlerService).toBeDefined();
    });

  });


});
