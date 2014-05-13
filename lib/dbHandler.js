/**
 * @fileOverview Database handler which is basically a wrapper around couchdb.js. Used to keep the CouchDB specific code out of the other modules.
 * @author Dennis Wilhelm
 */


var couchdb = require('./couchdb.js');

/**
 * Get all revisions of a specific document
 * @param  {String}   mapId the map id
 * @param  {String}   docId document/feature id
 * @param  {Function} cb    callback function
 */
module.exports.getDocumentRevisions = function(mapId, docId, cb) {
  couchdb.getDocumentRevisions(mapId, docId, cb);
};

/**
 * Stores an action of the current event in the database.
 * action = {action, date, id, rev, user}
 * @param  {String} mapId  the map id
 * @param  {Object} event  map event {feature, fid, action, user}
 * @param  {Object} dbInfo result of the db insert
 */

function storeAction(mapId, event, dbInfo) {
  if (dbInfo && dbInfo.rev && dbInfo.id) {
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
  } else {
    console.log('dbinfo (rev or id) not existing');
  }
}

/**
 * Stores a feature within the database. If successfull, also store the action.
 * @param  {String}   mapId the map id
 * @param  {Object}   event map event {feature, fid, action, user}
 * @param  {Function} cb    callback function
 */

function storeFeature(mapId, event, cb) {
  couchdb.insert(mapId, event.feature, event.fid, function(err, res) {
    if (err) {
      cb(err);
    } else {
      storeAction(mapId, event, res);
      if (cb) {
        cb(undefined, res);
      }
    }
  });
}

/**
 * Deletes a feature within the database. If successfull, also store the action.
 * @param  {String}   mapId the map id
 * @param  {Object}   event map event {feature, fid, action, user}
 */

function deleteFeature(mapId, event) {
  couchdb.delete(mapId, event.feature, event.fid, function(err, res) {
    if (err) {
      console.log(err);
    } else {
      storeAction(mapId, event, res);
    }
  });
}


module.exports.recordMapAction = function(mapId, event){
  event.date = new Date().getTime();
  couchdb.insert(mapId +'-record', event, undefined, function(){});
};


/**
 * Decides based on the event.action String if there is a feature to be deleted or stored
 * @param  {String} mapId the map id
 * @param  {Object} event map draw event {feature, fid, action, user}
 */
module.exports.saveFeature = function(mapId, event) {
  if (mapId && event && event.feature && event.fid && event.action) {
    if (event.action === 'deleted') {
      deleteFeature(mapId, event);
    } else {
      storeFeature(mapId, event, function(err, res){
        //TODO errorhandling!
        if(err) console.log(err);
        //else console.log(res);
      });
    }

  }
};

/**
 * Revert a feature to a given revision and stores the action in the db.
 * @param  {String}   mapId the map id
 * @param  {String}   key   feature id
 * @param  {String}   toRev revision to which the feature should be reverted
 * @param  {String}   user  the user performing the action
 * @param  {Function} cb    callback function
 */
module.exports.revertFeature = function(mapId, key, toRev, user, cb) {
  couchdb.revertFeature(mapId, key, toRev, function(err, res, data) {
    cb(err, res, data);
    var actionEvent = {
      action: 'reverted',
      user: user
    };
    //TODO: error handling!?!?!?
    storeAction(mapId, actionEvent, res);
  });
};

/**
 * Restores a deleted feature in the database
 * @param  {String}   mapId the map id
 * @param  {Object}   event map event {feature, fid, action, user}
 * @param  {Function} cb    [description]
 */
module.exports.restoreDeletedFeature = function(mapId, event, cb) {
  event.feature._deleted = false;
  delete event.feature.$$hashKey;
  storeFeature(mapId, event, function(err, res) {
    if (err) {
      cb(err);
    } else if (res.id) {
      couchdb.getDocument(mapId, res.id, cb);
    } else {
      console.log(res);
    }
  });
};

/**
 * Gets all features of a specific map from the database
 * @param  {String}   mapId    the map id
 * @param  {Function} callback callback(error, features)
 */
module.exports.getFeatures = function(mapId, callback) {
  couchdb.list(mapId,{} , callback);
};

/**
 * Gets all map actions from the database
 * @param  {String}   mapId    the map id
 * @param  {Function} callback callback(error, actions)
 */
module.exports.getActions = function(mapId, callback) {
  if (mapId) {
    couchdb.list(mapId + '-actions', {'limit': 200}, function(err, res) {
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
