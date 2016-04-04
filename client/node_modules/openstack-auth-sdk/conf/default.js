/**
 * Clout Auth Library
 */
module.exports = {
	env: process.env.NODE_ENV || 'production',
	baseUrl: 'http://devstack.vagrant:5000/v2.0',
	paths: {
		login: ['POST', '/tokens'],
		whoami: ['POST', '/tokens']
	},
	header: ['X-Auth-Token']
};
