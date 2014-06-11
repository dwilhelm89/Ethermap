'use strict';

function randomColor() {
  return '#FF0000';
}

describe('Service: Users', function() {

  var UsersService;

  // load the service's module
  beforeEach(function() {
    module('CollaborativeMap');

    inject(function(Users) {
      UsersService = Users;
    });

  });

  it('Users is defined', function() {
    expect(UsersService).toBeDefined();
  });

  it('Users has color', function() {
    var newUsers = {
      'mgV3OSaZG88BwWXB6mKO': 'User1',
      'lCUmCKNicw4aFrTw6mKQ': 'User2'
    };
    UsersService.receiveUsers(newUsers);
    expect(UsersService.getUserColorByName('User1')).toBeDefined();
  });

  it('User by ID is object', function() {
    var newUsers = {
      'mgV3OSaZG88BwWXB6mKO': 'User1',
      'lCUmCKNicw4aFrTw6mKQ': 'User2'
    };
    UsersService.receiveUsers(newUsers);
    expect(typeof UsersService.getUserById('lCUmCKNicw4aFrTw6mKQ')).toEqual('object');
  });

  it('User by ID is has color and name', function() {
    var newUsers = {
      'mgV3OSaZG88BwWXB6mKO': 'User1',
      'lCUmCKNicw4aFrTw6mKQ': 'User2'
    };
    UsersService.receiveUsers(newUsers);
    expect(UsersService.getUserById('lCUmCKNicw4aFrTw6mKQ').name).toBeDefined();
    expect(UsersService.getUserById('lCUmCKNicw4aFrTw6mKQ').color).toBeDefined();
  });

});
