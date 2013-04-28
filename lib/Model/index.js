var uuid = require('node-uuid');
var racer = require('../racer');
var util = require('../util');

module.exports = Model;

function Model() {
  racer.emit('Model:init', this);
}

Model.prototype.id = function() {
  return uuid.v4();
};

// Extend model on both server and client
require('./events');
require('./scope');
require('./collections');
require('./mutators');
require('./connection');
require('./ref');
require('./fn');

// Extend model for server
util.serverRequire(__dirname + '/bundle');
util.serverRequire(__dirname + '/connection.server');