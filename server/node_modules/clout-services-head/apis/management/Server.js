/**
 * 
 */
var debug = require('debug')('/api/management/server'),
	async = require('async'),
	clout = require('clout-js');

module.exports = {
	get: {
		path: '/management/server',
		description: 'get servers',
		method: 'get',
		params: {
			limit: ['limit', 'number', 'limit'],
			page: ['page', 'number', 'page']
		},
		// hooks: [ auth.isStaff() ],
		fn: function get(req, res) {
			var Server = req.models.Server,
				limit = req.query.limit || 250;
			if (limit > 250) {
				return res.badRequest('You cannot get more than 250 results');
			}
			async.waterfall([
				function getSubscribers(next) {
					Server.findAndCountAll({
						limit: limit
					}).then(function (results) {
						next(null, results.count, results.rows);
					}, next);
				}
			], function (err, count, servers) {
				if (err) {
					return res.error(err);
				}
				res.setHeader("X-Total-Count", count);
				res.ok(servers);
			});
		}
	},
	add: {
		path: '/management/server',
		description: 'add server',
		method: 'put',
		params: {
		},
		// hooks: [ auth.isStaff(0) ],
		fn: function add(req, res) {
			var Server = req.models.Server,
				input = JSON.parse(JSON.stringify(req.query));
			_.merge(input, req.body);
			debug('add:', input);
			Server.create({
				name: input.name,
				host: input.host,
				port: input.port,
				lastSeen: new Date(),
			}).then(res.success, res.error);
		}
	},
	update: {
		path: '/management/server/:id',
		description: 'save server',
		method: 'post',
		params: {
		},
		// hooks: [ auth.isStaff(0) ],
		fn: function save(req, res) {
			var Server = req.models.Server,
				input = JSON.parse(JSON.stringify(req.query));
			_.merge(input, req.body);
			debug('save:', input);
			Server.findById(req.params.id).then(function (server) {
				input.lastSeen = new Date();
				['name', 'host', 'port', 'lastSeen'].forEach(function (k) {
					typeof input[k] !== 'undefined' && (server[k] = input[k]);
				});
				server.save().then(res.ok, res.error);
			}, res.error);
		}
	},
	delete: {
		path: '/management/server/:id',
		description: 'delete server',
		method: 'delete',
		// hooks: [ auth.isStaff() ],
		fn: function del(req, res) {
			var Server = req.models.Server;
			Server.findById(req.params.id).then(function (server) {
				server.destroy().then(res.success, res.error);
			}, res.error);
		}
	}
}