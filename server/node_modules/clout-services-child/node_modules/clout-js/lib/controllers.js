/**
 * Clout Javascript Framework
 */
var debug = require('debug')('clout:controllers'),
	async = require('async'),
	_ = require('lodash'),
	utils = require('./utils')
	express = require('express'),
	router = express.Router();

var path = require('path'),
	FILENAME_REGEX = /\/([\d\w]*).js/;

module.exports = function controllers(clout) {
	if (!clout.appDir) {
		return;
	}
	var CONTROLLERS_DIR = path.join(clout.appDir, 'controllers');
	debug('CONTROLLERS_DIR: %s', CONTROLLERS_DIR);
	utils.getGlobbedFiles(CONTROLLERS_DIR + '/**/*.js').forEach(function load(filePath) {
		debug('loading controller %s:%s', controllerName);
		var controller = require(filePath),
			controllerName = FILENAME_REGEX.exec(filePath)[0];

		if (!controller.path) {
			return;
		}
		var hooks = controller.hooks || [],
			method = controller.method ? controller.method.toLowerCase() : 'all';

		// log endpoint request
		router[method](controller.path, function (req, res, next) {
			debug('Endpoint [%s] %s', req.method, req.path);
			next();
		});

		// load hook first
		hooks.forEach(function (hook) {
			// console.log('loaded hook', controller.path);
			router[method](controller.path, function (req) {
				hook.name && console.info('hook:', hook.name);
				hook.apply(this, arguments);
			}); 
		});

		// load controller
		if (controller.fn) {
			debug('loaded endpoint [%s] %s', method, controller.path);
			router[method](controller.path, function (req) {
				debug('loading controller %s:%s', controllerName);
				controller.fn.apply(this, arguments);
			});
		}
	});
	debug('attached router');
	clout.app.use('/', router);
};