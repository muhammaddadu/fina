/**
 * Clout CLI
 */
var _ = require('lodash'),
	debug = require('debug')('clout:list'),
	request = require('request');

module.exports = {
	command: 'list',
	desc: 'List current user services',
	ensureLoggedIn: true,
	action: function (argv) {
		var userId = this.user.id;
		request({
			method: 'GET',
			uri: $config.servicesUrl + '/api/dev/' + userId + '/services',
			headers: {
				'User-Agent': 'cloutCLI',
				'X-Auth-Token': $config.user.token
			},
			json: true
		}, function (err, resp, body) {
			if (err) { return console.error(String(err).red); }
			if (!body.success) { return console.error(String(body).red); }
			var rows = body.data;
			if (rows.length === 0) { return console.log('You have no published services'); }
			console.log(rows.length);
		});
	}
};