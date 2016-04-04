/**
 * Clout Javascript Framework
 * @config
 */

var path = require('path'),
	fs = require('fs'),
	_ = require('lodash'),
	utils = require('./utils'),
	debug = require('debug')('clout:config'),
	clout = require('../');

var config = {
	env: process.env.NODE_ENV || 'development', // default enviroment to development
	sessionSecret: '<placeholder>',
	http: undefined,
	https: undefined
};

// export config
module.exports = config;

(function initialize() {
	var confDir = undefined;
	clout.appDir && (confDir = path.join(clout.appDir, 'conf'));
	if (confDir) {
		// load default configuration
		var defaultConfFilePath = path.join(confDir, 'default.js');
		debug('defaultConfFilePath: %s', defaultConfFilePath);
		if (fs.existsSync(defaultConfFilePath)) {
			_.merge(config, require(defaultConfFilePath));
		}
		// load enviromental specific configuration
		var globPattern = confDir + '/**/*.' + config.env + '.js*';
		utils.getGlobbedFiles(globPattern).forEach(function (filePath) {
			debug('loadConfigFrom: %s', filePath);
			_.merge(config, require(filePath));
		});
	}
})();