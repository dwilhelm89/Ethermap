/**
 * @fileOverview Handles the CouchDB databse connection.
 * @exports CouchDB
 * @author Dennis Wilhelm
 */

var nano = require('nano')('http://localhost:5984');

/**
 * Returns the requested database. If not existing, create a new one.
 * @param {String} name   database name
 * @param {Function} callback
 */

function getOrCreateDb(name, callback) {
  nano.db.get(name, function(err, body) {
    if (err && err.status_code === 404) {
      nano.db.create(name, function() {
        callback(nano.use(name));
      });
    } else {
      callback(nano.use(name));
    }

  });
}

/**
 * Get all revisions of one document.
 * Results in multiple GETs as there is no method to get all at one.
 * @param {Object} db database object
 * @param {String} docId the document id
 * @param {Array} revs String array with the revision ids
 * @param {Function} cb callback
 */

function fetchAllRevDocs(db, docId, revs, cb) {
  var revisions = [];
  if (revs) {
    revs.forEach(function(rev, i) {
      db.get(docId, {
        rev: rev.rev
      }, function(err, res) {
        if (err) cb(err);
        else {
          revisions.push(res);
          if (revs.length - 1 === i) {
            cb(undefined, revisions);
          }
        }
      });
    });
  }
}

/**
*  If the document has been deleted, there are no revs available.
* Document can be retrieved by querying all documents and get doc with 
* specific rev
* @param {Object} db database object
* @param {String} docId document id
* @param {Function} cb callback
*/

function getDeletedDocument(db, docId, cb) {
  db.list({
    keys: [docId]
  }, function(err, res) {
    if (err) console.log(err);
    else if (res && res.rows.length > 0) {
      db.get(docId, {
        rev: res.rows[0].value.rev
      }, function(error, result) {
        cb(error, [result]);
      });

    }
  });
}

/**
* Get all revision Ids of a document
* @param {Object} db database object
* @param {String} docId document id
* @param {Function} cb callbak
*/
function getRevisionsIds(db, docId, cb) {

  db.get(docId, {
    revs_info: true,
  }, function(err, res) {
    //special treatment for deleted documents
    if (err && err.reason && err.reason === 'deleted') {
      getDeletedDocument(db, docId, cb);
    } else if (res && res._revs_info) {
      fetchAllRevDocs(db, docId, res._revs_info, cb);
    } else {
      cb(err);
    }
  });
}

/**
* Retrieves one document from the datbase
* @param {String} mapId the map id = name of the database
* @param {String} docId document id
* @param {Function} cb  callback
*/
module.exports.getDocument = function(mapId, docId, cb) {
  var db = nano.db.use(mapId);
  db.get(docId, {
    include_docs: true
  }, cb);
};

/**
* Get all revisions of a single document
* @param {String} mapId map id
* @param {String} docId document id
* @param {Function} cb callback
*/
module.exports.getDocumentRevisions = function(mapId, docId, cb) {
  var db = nano.db.use(mapId);
  getRevisionsIds(db, docId, function(err, res) {
    cb(err, res);
  });
};

/**
* Get all features of a database
* @param {String} dbId database name
* @param {Function} callback
*/
module.exports.list = function(dbId, callback) {
  getOrCreateDb(dbId, function(db) {
    var params = {
      "include_docs": true
    };
    db.list(params, function(err, body) {
      if (!err) {
        callback(undefined, body);
      } else {
        callback(err);
      }
    });
  });
};

/**
* Gets the changes made to the database
* @param {String} dbId database name
* @param {Function} callbak
*/
module.exports.getChanges = function(dbId, callback) {
  getOrCreateDb(dbId, function(db) {
    db.changes(function(err, body) {
      if (!err) {
        callback(undefined, body);
      } else {
        callback(err);
      }
    });
  });
};

/**
* Updates a document in the database.
* Has to retrieve the document in order to get the latest revision id.
* Otherwise a version conflict could occur.
* @param {Object} db database object
* @param {Object} obj the object which should be update
* @param {String} key document id
* @param {Function} callback
*/
function update(db, obj, key, callback) {
  db.get(key, function(error, existing) {
    if (!error) obj._rev = existing._rev;
    db.insert(obj, key, callback);
  });
}

/**
* Inserts a document into the database.
* If a version conflict occurs, update the feature.
* @param {String} dbId database name
* @param {Object} data the document which should be inserted
* @param {String} primary id/key of the document
* @param {Function} callback
*/
module.exports.insert = function(dbId, data, primary, callback) {
  getOrCreateDb(dbId, function(db) {
    db.insert(data, primary, function(err, res) {
      if (err) {
        if (err.status_code && err.status_code === 409) {
          update(db, data, primary, function(err2, res2) {
            if (err2) {
              callback(err2);
            } else {
              callback(undefined, res2);
            }
          });
        } else {
          console.log(err);
        }
      } else {
        callback(undefined, res);
      }
    });
  });
};

/**
* Delete a document from the database. Has to get the latest version first, to prevent a conflict.
* @param {String} dbId database name
* @param {Object} obj document which should be deleted
* @param {String} key id of the document
* @param {Function} callback
*/
module.exports.delete = function(dbId, obj, key, callback) {
  getOrCreateDb(dbId, function(db) {
    db.get(key, function(error, existing) {
      if (!error) {
        obj._rev = existing._rev;

        existing._deleted = true;

        db.insert(existing, key, callback);
      } else {
        console.log(error);
      }
    });

  });
};

/**
* Get the latest revision of a document
* @param {Object} db database object
* @param {String} key document id
* @param {Function} cb callback
*/
function getLatestRevision(db, key, cb) {
  db.get(key, {
    revs_info: true
  }, function(err, res) {
    if (err) cb(err);
    else cb(undefined, res._revs_info[0].rev);

  });
}

/**
* Reverts a document in the database. 
* This function retrieves the document with a given revision and 
* creates a new revision whith the previous content.
* => update with a previous revision as document
* @param {String} dbId database name
* @param {String} key document id
* @param {String} toRev revision to which the document will be reverted
* @param {Function} cb callback
*/
module.exports.revertFeature = function(dbId, key, toRev, cb) {
  var db = nano.use(dbId);
  getLatestRevision(db, key, function(err, currentRev) {
    //TODO: ERRORHANDLING
    if (err) console.log(err);
    db.get(key, {
      rev: toRev
    }, function(err, res) {
      if (!err) {
        res._rev = currentRev;
        db.insert(res, key, function(iErr, iRes) {
          cb(iErr, iRes, res);
        });
      } else {
        cb(err);
      }
    });
  });
};
