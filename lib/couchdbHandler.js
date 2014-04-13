var couchdb = require('./couchdb.js');


function storeAction(mapId, event, dbInfo) {
  var action = {
    'action': event.action,
    'date': new Date()
      .getTime(),
    'id': dbInfo.id,
    'rev': dbInfo.rev,
    'user': event.user
  };
  couchdb.insert(mapId + '-actions', action, undefined, function(err) {
    if (err) {
      console.log(err);
    }
  });
}

function storeFeature(mapId, event) {
  couchdb.insert(mapId, event.feature, event.fid, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      storeAction(mapId, event, res);
    }
  });
}


module.exports.saveFeature = function(mapId, event) {
  if (mapId && event && event.feature && event.fid && event.action) {

    storeFeature(mapId, event);

  }
};


module.exports.getActions = function(mapId, callback) {
  if (mapId) {
    couchdb.list(mapId + '-actions', function(err, res) {
      if (err) {
        callback(err);
      } else {
        if (res && res.rows) {
          res = res.rows.map(function(r) {
            if (r.doc) {
              return r.doc;
            }
          });
        }
        callback(undefined, res);
      }
    });
  }
};
