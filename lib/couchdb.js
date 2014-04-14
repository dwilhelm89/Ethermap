var nano = require('nano')('http://localhost:5984');

//callback(db)

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



//rows.[i].doc => data
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

function update(db, obj, key, callback) {
  db.get(key, function(error, existing) {
    if (!error) obj._rev = existing._rev;
    db.insert(obj, key, callback);
  });
}

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
