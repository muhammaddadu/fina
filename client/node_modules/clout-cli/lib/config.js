/**
 * Clout CLI
 * @config
 */
var path = require('path'),
	fs = require('fs-extra'),
	_ = require('lodash'),
	utils = require('./utils'),
	osenv = require('osenv'),
	debug = require('debug')('clout:config');

module.exports = function config(clout) {
	var CONFIG_DIR = path.join(__dirname, '../conf/'),
		DEFAULT_CONF_FILE = path.join(CONFIG_DIR, 'default.js'),
		config = require(DEFAULT_CONF_FILE);
	debug('CONFIG_DIR: %s', CONFIG_DIR);
	debug('DEFAULT_CONF_FILE: %s', DEFAULT_CONF_FILE);
	// load env config files
	function loadConfigForEnv(baseDir, env) {
		var globPattern = baseDir + '/**/*.' + env + '.js*';
		utils.getGlobbedFiles(globPattern).forEach(function (filePath) {
			debug('loadConfigFrom: %s', filePath);
			_.merge(config, require(filePath));
		});
	}
	loadConfigForEnv(CONFIG_DIR, config.env);

	// load from user directory
	var USER_DIR = path.join(osenv.home(), '.clout'),
		USER_CONF_DIR = path.join(USER_DIR, 'conf');

	debug('USER_DIR: %s', USER_DIR);
	debug('USER_CONF_DIR: %s', USER_CONF_DIR);

	// ensure USER_DIR, USER_CONF_DIR exists
	fs.ensureDir(USER_DIR);
	fs.ensureDir(USER_CONF_DIR);
	loadConfigForEnv(USER_CONF_DIR, config.env);

	// special user methods
	config.user = config.user || {};
	config.user.save = function () {
		var USER_FILE = path.join(USER_CONF_DIR, 'user.' + config.env + '.json');
		debug('USER_FILE: %s', USER_FILE);
		fs.writeFileSync(USER_FILE, JSON.stringify({user: config.user}, null, '\t'));
	}

	global.$config = clout.config = config;
}
