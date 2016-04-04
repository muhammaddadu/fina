/**
 * Clout Auth Library
 */
var utils = require('./utils'),
	path = require('path'),
	fs = require('fs'),
	_ = require('lodash'),
	debug = require('debug')('clout-auth:config');

module.exports = function config(auth) {
	var CONF_DIR = path.join(__dirname, '../conf/'),
		DEFAULT_CONFIG_FILE = path.join(CONF_DIR, 'default.js'),
		config = require(DEFAULT_CONFIG_FILE);
	// initialize
	function setEnv(env) {
		debug('CONF_DIR: %s', CONF_DIR);
		debug('DEFAULT_CONFIG_FILE: %s', DEFAULT_CONFIG_FILE);
		config = require(DEFAULT_CONFIG_FILE); // reset config
		debug('default config: %s', JSON.stringify(config));
		var globPattern = CONF_DIR + '/**/*.' + env + '.js';
		utils.getGlobbedFiles(globPattern).forEach(function (filePath) {
			debug('loadConfigFrom: %s', filePath);
			_.merge(config, require(filePath));
		});
		debug('config: %s', JSON.stringify(config));
	}

	auth.setEnv = setEnv; // expose setEnv
	setEnv(config.env);
	auth.config = config; // link config to auth.config
};