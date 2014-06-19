'use strict';

//Store all WebSockets event listeners, so they can be called manually
var sockets = {};

//Global io object as socket.io isn't loaded in the testrunner
var io = {
  connect: function() {
    return {
      emit: function() {},
      on: function(channel, cb) {
        sockets[channel] = cb;
      }
    };
  }
};


describe('SynchronizeMap', function() {
  var synchronizeMapService, map, drawnItems;

  beforeEach(module('CollaborativeMap'));

  beforeEach(inject(function(SynchronizeMap) {
    synchronizeMapService = SynchronizeMap;

  }));

  beforeEach(function() {
    //Create the map element
    var element = document.createElement('div');
    /*global L:false */
    map = L.mapbox.map(element);
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
  });


  it('the maps viewport should change when a movementEvent is received', inject(function(MapHandler) {
    //Mock the scope and initialize the sync
    synchronizeMapService.init(map, {
      '$root': {
        '$on': function() {}
      },
      isWatchingAll: true,
      userBounds: {},
      mapId: 'test',
      userName: 'dnns'
    }, drawnItems);


    MapHandler.initMapHandler(map, drawnItems, {}, undefined);

    //Set an initial view
    map.setView([10, 10], 1);
    var lat = map.getCenter().lat;

    //Examplary MapMovement event
    var event = {
      'event': {
        nE: [1, 1],
        sW: [0, 0],
        userId: 'dnns'
      }
    };
    sockets['test-mapMovement'](event);

    expect(map.getCenter().lat).toNotEqual(lat);
  }));

  it('user bounds should be stored on map movements', inject(function(MapHandler) {
    //Mock the scope and initialize the sync
    var scope = {
      '$root': {
        '$on': function() {}
      },
      isWatchingAll: true,
      userBounds: {},
      mapId: 'test',
      userName: 'dnns'
    };
    synchronizeMapService.init(map, scope, drawnItems);


    MapHandler.initMapHandler(map, drawnItems, {}, undefined);

    //Set an initial view
    map.setView([10, 10], 1);

    //Examplary MapMovement event
    var event = {
      'event': {
        nE: [1, 1],
        sW: [0, 0],
        userId: 'dnns'
      }
    };
    expect(scope.userBounds.dnns).toBeUndefined();
    sockets['test-mapMovement'](event);
    expect(scope.userBounds.dnns).toBeDefined();
  }));

  it('feature should be created if received via Websockets', inject(function(MapHandler) {
    //Mock the scope and initialize the sync
    var scope = {
      '$root': {
        '$on': function() {}
      },
      selectedFeature: {
        fid: ''
      },
      views: {},
      mapId: 'test',
      userName: 'dnns'
    };
    synchronizeMapService.init(map, scope, drawnItems);
    MapHandler.initMapHandler(map, drawnItems, {}, undefined);

    var event = {
      'event': {
        'action': 'created feature',
        'feature': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'Point',
            'coordinates': [13.597211837768553, 51.10513874599324]
          },
          'lastAction': 'created feature'
        },
        'fid': '140318644934434313',
        'user': 'dnns'
      }
    };

    sockets['test-mapDraw'](event);
    expect(drawnItems._layers[event.event.fid]).toBeDefined();
  }));

  it('feature should be updated if received via Websockets', inject(function(MapHandler) {
    //Mock the scope and initialize the sync
    var scope = {
      '$root': {
        '$on': function() {}
      },
      selectedFeature: {
        fid: ''
      },
      views: {},
      mapId: 'test',
      userName: 'dnns'
    };
    synchronizeMapService.init(map, scope, drawnItems);
    MapHandler.initMapHandler(map, drawnItems, {}, undefined);


    var originalFeature = {
      'action': 'created feature',
      'feature': {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'Point',
          'coordinates': [13.705015182495117, 51.064539870065275]
        },
        'lastAction': 'created feature'
      },
      'fid': '140318644934434313',
      'user': 'dnns'
    };
    MapHandler.addGeoJSONFeature(map, originalFeature, drawnItems, false, '#FFFFFF');
    map.addLayer(drawnItems._layers[originalFeature.fid]);

    var oldLat = drawnItems._layers['140318644934434313']._latlng.lat;

    var event = {
      'event': {
        'action': 'edited geometry',
        'feature': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'Point',
            'coordinates': [0, 0]
          },
          'lastAction': 'created feature'
        },
        'fid': '140318644934434313',
        'user': 'paul'
      }
    };
    sockets['test-mapDraw'](event);
    expect(drawnItems._layers['140318644934434313']._latlng.lat).toNotEqual(oldLat);
  }));

  it('feature should be deleted if received via Websockets', inject(function(MapHandler) {
    //Mock the scope and initialize the sync
    var scope = {
      '$root': {
        '$on': function() {}
      },
      selectedFeature: {
        fid: ''
      },
      views: {},
      mapId: 'test',
      userName: 'dnns'
    };
    synchronizeMapService.init(map, scope, drawnItems);
    MapHandler.initMapHandler(map, drawnItems, {}, undefined);


    var originalFeature = {
      'action': 'created feature',
      'feature': {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'Point',
          'coordinates': [13.705015182495117, 51.064539870065275]
        },
        'lastAction': 'created feature'
      },
      'fid': '140318644934434313',
      'user': 'dnns'
    };
    MapHandler.addGeoJSONFeature(map, originalFeature, drawnItems, false, '#FFFFFF');
    map.addLayer(drawnItems._layers[originalFeature.fid]);

    expect(drawnItems._layers['140318644934434313']).toBeDefined();

    var event = {
      'event': {
        'action': 'deleted feature',
        'feature': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'Point',
            'coordinates': [0, 0]
          },
          'lastAction': 'created feature'
        },
        'fid': '140318644934434313',
        'user': 'paul'
      }
    };
    sockets['test-mapDraw'](event);
    expect(drawnItems._layers['140318644934434313']).toBeUndefined();
  }));


});
