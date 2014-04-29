var couchdb = require('./couchdb.js');

module.exports.getDocumentRevisions = function(mapId, docId, cb){
  couchdb.getDocumentRevisions(mapId, docId, cb);
};


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

function storeFeature(mapId, event, cb) {
  couchdb.insert(mapId, event.feature, event.fid, function(err, res) {
    if (err) {
      console.log(err);
      cb(err);
    } else {
      storeAction(mapId, event, res);
      cb(undefined, res);
    }
  });
}

function deleteFeature(mapId, event) {
couchdb.delete(mapId, event.feature, event.fid, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      storeAction(mapId, event, res);
    }
  });
}


module.exports.saveFeature = function(mapId, event) {
  if (mapId && event && event.feature && event.fid && event.action) {
    if (event.action === 'deleted') {
      deleteFeature(mapId, event);
    } else {
      storeFeature(mapId, event);
    }

  }
};

module.exports.revertFeature = function(mapId, key, toRev, user, cb){
  couchdb.revertFeature(mapId, key, toRev, function(err, res, data){
    cb(err, res, data);
    var actionEvent = {
      action: 'reverted',
      user: user
    };
    storeAction(mapId, actionEvent ,res);
  });
};

module.exports.restoreDeletedFeature = function(mapId, event, cb){
  event.feature._deleted = false;
  delete event.feature.$$hashKey;
  storeFeature(mapId, event, function(err, res){
    if(err){
      cb(err);
    }else if(res.id){
      couchdb.getDocument(mapId, res.id, cb);
    }else{
      console.log(res);
    }
  });
};


module.exports.getFeatures = function(mapId, callback) {
  couchdb.list(mapId, callback);
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
