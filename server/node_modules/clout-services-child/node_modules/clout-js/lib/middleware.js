/**
 * Clout Javascript Framework
 */
var debug = require('debug')('clout:middleware'),
	async = require('async'),
	_ = require('lodash'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	ejs = require('ejs'),
	session = require('express-session'),
	cookieSession = require('cookie-session'),
	RedisStore = require('connect-redis')(session),
	express = require('express'),
	compress = require('compression');

var path = require('path');

module.exports = function middleware(clout) {
	debug('appending compression to middleware');
	clout.app.use(compress());

	// app client configuration
	var CLOUT_VIEWS_DIR = path.join(__dirname, '../resources/views');
	if (clout.appDir) {
		var PUBLIC_DIR = path.join(clout.appDir, 'public'),
			VIEWS_DIR = path.join(clout.appDir, 'views');

		clout.app.use(express.static(PUBLIC_DIR)); // public folder
		clout.app.set('views', [VIEWS_DIR, CLOUT_VIEWS_DIR]); // set views folder
		clout.app.set('view engine', 'ejs'); // set the view engine to ejs
	} else {
		clout.app.set('views', [CLOUT_VIEWS_DIR]); // set views folder
	}

	// express conf
	clout.app.set('x-powered-by', false);
	clout.app.set('env', clout.config.env);

	clout.app.use(bodyParser.json()); // allow json data in body
	debug('loaded bodyParser.json()');
	clout.app.use(bodyParser.urlencoded({
		extended: false
	})); // allow urlencoded data
	debug('loaded bodyParser.urlencoded()');
	clout.app.use(bodyParser.text({}));
	debug('loaded bodyParser.text()');
	clout.app.use(bodyParser.raw({}));
	debug('loaded bodyParser.raw()');

	clout.app.use(cookieParser());
	debug('loaded cookieParser()');

	var redisServerConf = clout.config.redisServer;
	if (redisServerConf) {
		debug('loading redis session');
	    clout.app.use(session({
	        store: new RedisStore({
	            host: redisServerConf.host,
	            port: redisServerConf.port,
	            prefix: 'sess'
	        }),
	        secret: clout.config.session.secret,        //cookie secret
	        resave: redisServerConf.resave || true,
	        saveUninitialized: redisServerConf.saveUninitialized || false,
	        key: 'express.sid'
	    }));
	} else if (clout.config.session) {
		var sessionConf = {
			secret: clout.config.session.secret,
			resave: true,
			saveUninitialized: false
		};
		if (clout.config.session.cookie) {
			sessionConf.cookie = clout.config.session.cookie;
		}
		clout.app.use(session(sessionConf));
		// clout.app.use(cookieSession({
		// 	keys: [clout.config.sessionSecret]
		// }));
	}

	debug('loaded session()');

	// Add Multipart Form Handler
	
	const HTTP_RESPONSE_MAP = require('../resources/conf/httpResponseMap.json');

	// custom request middleware
	// clout.app.all('*', function (req, res, next) {
	// 	(typeof req.body === 'object') && _.merge(req.params, req.body);
	// 	(typeof req.query === 'object') && _.merge(req.params, req.query);
	// 	next();
	// });

	// custom response middleware
	clout.app.use(function(req, res, next) {
		// Load custom response methods
		function createJsonResponse(type, opts) {
			return function(payload) {
				// console.log('send', 'opts.code', payload);
				res.status(opts.code);
				if (opts.render && /text\/html/.test(req.headers.accept)) {
					return res.render('404', payload);
				}
				// TODO:- add support for requested data type such as txt, csv
				// Add support for understanding file extentions
				res.type('json').send(JSON.stringify(_.merge({
					data: payload
				}, opts)));
			};
		}

		for (var type in HTTP_RESPONSE_MAP) {
			debug('loaded res custom response method `%s`', type);
			res[type] = createJsonResponse(type, HTTP_RESPONSE_MAP[type]);
		}

		// bind models to req
		req.models = clout.models;
		debug('binded models to req');

		return next();
	});

	// No response handler
	setTimeout(function () {
		// Assume 'not found'
		clout.app.use(function(err, req, res, next) {
			// If the error object doesn't exists
			if (!err) {
				return next();
			}
			
			console.error(err.stack);
			res.status('500');
			res.type('json').send({success: false});
		});

		// Assume 404 since no middleware responded
		clout.app.use(function(req, res) {
			res.notFound();
		});
		debug('loaded 404 handler');
	}, 1000);
};
