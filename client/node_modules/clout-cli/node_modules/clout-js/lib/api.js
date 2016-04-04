/**
 * Clout Javascript Framework
 */
var debug = require('debug')('clout:api'),
	async = require('async'),
	_ = require('lodash'),
	express = require('express'),
	router = express.Router(),
	utils = require('./utils');

var Q = require('q');

var path = require('path'),
	FILEFOLDER_REGEX = /\/apis\/(.*).js/;

module.exports = function api(clout) {
	if (!clout.appDir) {
		return;
	}
	var API_DIR = path.join(clout.appDir, 'apis');
	debug('API_DIR: %s', API_DIR);
	utils.getGlobbedFiles(API_DIR + '/**/*.js').forEach(function load(filePath) {
		debug('loading api file: %s', filePath);
		var apis = require(filePath),
			group = FILEFOLDER_REGEX.exec(filePath)[1];
		debug('group: %s, apis: %s', group, Object.keys(apis).length);
		Object.keys(apis).forEach(function loadApi(apiName) {
			debug('loading api %s:%s', group, apiName);
			var api = apis[apiName];
			if (!api.path) {
				return;
			}
			var hooks = api.hooks || [],
				method = api.method ? api.method.toLowerCase() : 'all';

			// log endpoint request
			router[method](api.path, function (req, res, next) {
				debug('Endpoint [%s] /api%s', req.method, req.path);
				next();
			});

			// load hook first
			hooks.forEach(function (hook) {
				// debug('loaded hook', api.path);
				if (typeof hook === 'string') {
					return;
				}
				router[method](api.path, function (req) {
					hook.name && debug('hook:', hook.name);
					hook.apply(this, arguments);
				});
			});

			// load api
			if (api.fn) {
				debug('loaded endpoint [%s] /api%s', method, api.path);
				router[method](api.path, function (req) {
					debug('loading api %s:%s', group, apiName);
					api.fn.apply(this, arguments);
				});
			}
		});
	});
	debug('attached router');
	clout.app.use('/api', router);

	/**
	 * internal API caller
	 */
	clout.callApi = function callApi(api, opts, cb) {
        var deferred = Q.defer();
        // deferred.reject,deferred.resolve
        if (true) {
        	return deferred.reject('API not found');
        }
        // to implement
        deferred.promise.nodeify(cb);
        return deferred.promise;
	}
};