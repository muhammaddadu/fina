/**
 * Server Model
 */

var clout = require('clout-js'),
	Sequelize = clout.Sequelize,
	sequelize = clout.sequelize;

var Promise = require('promise'),
	debug = require('debug')('/models/Server'),
	async = require('async');

if (!Sequelize) {
	return;
}

var definition = {
		name: { type: Sequelize.STRING, allowNull: false },
		host: { type: Sequelize.STRING, allowNull: false },
		port: { type: Sequelize.STRING, allowNull: false },
		lastSeen: { type: Sequelize.DATE, allowNull: false },
	},
	props = {}
	Server = sequelize.define('Server', definition, props);

require('./Service').belongsTo(Server,	{ foreignKey: 'server_id' });

module.exports = Server;
