/**
 * Service Model
 */

var clout = require('clout-js'),
	Sequelize = clout.Sequelize,
	sequelize = clout.sequelize;

var Promise = require('promise'),
	debug = require('debug')('/models/Service'),
	async = require('async');

if (!Sequelize) {
	return;
}

var definition = {
		name: { type: Sequelize.STRING, allowNull: false },
		user_id: { type: Sequelize.STRING, allowNull: false },
		archive: { type: Sequelize.STRING, allowNull: false },
		status: { type: Sequelize.STRING, allowNull: false },
		hosts: {
			type: Sequelize.TEXT,
			allowNull: true,
			set: function (value) {
				this.setDataValue('hosts', JSON.stringify(value));
			},
			get: function () {
				var hosts = this.getDataValue('hosts');
				return !hosts ? [] : JSON.parse(hosts);
			}
		},
	},
	props = {}
	Service = sequelize.define('Service', definition, props);

module.exports = Service;