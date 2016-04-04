/**
 * Clout CLI
 */
var _ = require('lodash'),
	debug = require('debug')('clout:login'),
	cloutAuthSDK = require('openstack-auth-sdk');

module.exports = {
	command: 'login',
	desc: 'Clout Platform Login',
	options: [
		['--username', 'platform username'],
		['--password', 'platform password']
	],
	required: [
		{
			description: 'Enter your username:',
			option: 'username',
			name: 'username',
			required: true,
		},
		{
			description: 'Enter your password:',
			option: 'password',
			name: 'password',
			required: true,
			hidden: true
		}
	],
	action: function (argv) {
		var username = argv.param('username'),
			password = argv.param('password');
		cloutAuthSDK.request.login({
			auth: {
				passwordCredentials: {
					username: username,
					password: password
				},
				tenantName: ''
			}
		}, function (err, body, token) {
			debug('err: %s', err);
			debug('body: %s', JSON.stringify(body));
			debug('token: %s', JSON.stringify(token));
			if (err) {
				console.error(err.red);
				return;
			}
			$config.user.token = token;
			$config.user.save();
			console.info('Howdy, %s. You are now logged in.', body.user.name);
		});
	}
};