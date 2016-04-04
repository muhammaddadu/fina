/**
 * Clout Auth Library
 */
var auth = module.exports,
	debug = require('debug')('clout-auth:base'),
	async = require('async');

(function initialize() {
	(require('./lib/config'))(auth); // config && setEnv
	(require('./lib/request'))(auth); // request
})();

// var token = null;
// async.series([
// 	function login(next) {
// 		auth.request.login({
// 			auth: {
// 				passwordCredentials: {
// 					username: 'tester',
// 					password: 'tester'
// 				},
// 				tenantName: ''
// 			}
// 		}, function (err, user, _token) {
// 			debug('auth.request.login');
// 			debug('err: %s', err);
// 			debug('user: %s', JSON.stringify(user));
// 			debug('token: %s', JSON.stringify(_token));
// 			token = _token || {};
// 			next();
// 		});
// 	},
// 	function whoami(next) {
// 		auth.request.whoami(token, function (err, user, _token) {
// 			debug('auth.request.whoami');
// 			debug('err: %s', err);
// 			debug('user: %s', JSON.stringify(user));
// 			debug('token: %s', JSON.stringify(_token));
// 			next();
// 		});
// 	}
// ], function logout() {
// 	console.log('done');
// });