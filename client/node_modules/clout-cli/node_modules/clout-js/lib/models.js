/**
 * Clout Javascript Framework
 */
var debug = require('debug')('clout:models'),
	async = require('async'),
	_ = require('lodash'),
	Sequelize = require('sequelize'),
	utils = require('./utils');

var path = require('path'),
	FILENAME_REGEX = /\/([\d\w]*).js/;

module.exports = function models(clout) {
	if (!clout.appDir) {
		return;
	}
	var MODELS_DIR = path.join(clout.appDir, 'models'),
		sequelize = undefined;

	// load connection
	if (clout.config.sequelize) {
		var sconf = clout.config.sequelize;
		clout.Sequelize = Sequelize;
		clout.sequelize = sequelize = new Sequelize(sconf.database, sconf.username, sconf.password, sconf.connection);
	}

	// load models
	debug('loading models');
	debug('MODELS_DIR: %s', MODELS_DIR);
	clout.models = {};
	utils.getGlobbedFiles(MODELS_DIR + '/**/*.js').forEach(function load(filePath) {
		var fileName = FILENAME_REGEX.exec(filePath)[1];
		debug('loading model %s', fileName);
		clout.models[fileName] = require(filePath);
	});
};
