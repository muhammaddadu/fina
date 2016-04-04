/**
 * Clout CLI
 */
var _ = require('lodash'),
	debug = require('debug')('clout:login'),
	cloutAuthSDK = require('openstack-auth-sdk');

module.exports = {
	command: 'whoami',
	desc: 'Check current user status',
	ensureLoggedIn: true,
	action: function (argv) {
		cloutAuthSDK.request.whoami($config.user.token, function (err, body, token) {
			debug('err: %s', err);
			debug('body: %s', JSON.stringify(body));
			debug('token: %s', JSON.stringify(token));
			if (body && body.error && body.error.code && body.error.code === 401) {
				console.log('Your session has expired. Please login again!'.red);
				return;
			}
			if (err) {
				console.error(err.red);
				return;
			}
			console.info(JSON.stringify(body, null, '\t'));
		});
	}
};