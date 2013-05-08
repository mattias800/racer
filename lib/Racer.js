var EventEmitter = require('events').EventEmitter;
var Model = require('./Model');
var util = require('./util');

module.exports = Racer;

function Racer() {}

util.mergeInto(Racer.prototype, EventEmitter.prototype);

// Make classes accessible for use by plugins and tests
Racer.prototype.Model = Model;
Racer.prototype.util = util;

// Support plugins on racer instances
Racer.prototype.use = util.use;

Racer.prototype.init = function(data) {
  var racer = this;
  // Init is executed async so that plugins can extend Racer even if they are
  // included after the main entry point in the bundle
  setTimeout(function() {
    var model = new Model;

    model._createConnection();

    // Re-create documents for all model data
    for (var collectionName in data.collections) {
      var collection = data.collections[collectionName];
      for (var id in collection) {
        model.getOrCreateDoc(collectionName, id, collection[id]);
      }
    }
    // Re-subscribe to document subscriptions
    for (var path in data.subscribedDocs) {
      var segments = path.split('.');
      model.subscribeDoc(segments[0], segments[1]);
      model._subscribedDocs[path] = data.subscribedDocs[path];
    }
    // Init fetchedDocs counts
    for (var path in data.fetchedDocs) {
      model._fetchedDocs[path] = data.fetchedDocs[path];
    }
    // Init and re-subscribe queries as appropriate
    model._initQueries(data.queries);

    // Re-create refs
    for (var i = 0; i < data.refs.length; i++) {
      var item = data.refs[i];
      model.ref(item[0], item[1]);
    }
    // Re-create refLists
    for (var i = 0; i < data.refLists.length; i++) {
      var item = data.refLists[i];
      model.refList(item[0], item[1], item[2]);
    }
    // TODO: Re-create fns

    racer._model = model;
    racer.emit('ready', model);
  }, 0);
  return this;
};

Racer.prototype.ready = function(cb) {
  if (this._model) return cb(this._model);
  this.once('ready', cb);
};

util.serverRequire(__dirname + '/Racer.server.js');