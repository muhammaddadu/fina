/**
 * 
 */
var debug = require('debug')('/api/dev/services'),
	async = require('async'),
	multiparty = require('multiparty'),
	clout = require('clout-js');

module.exports = {
	list: {
		path: '/dev/:userid/service',
		description: 'list services',
		method: 'get',
		params: {
			limit: ['limit', 'number', 'limit'],
			page: ['page', 'number', 'page']
		},
		// hooks: [ auth.isLoggedIn() ],
		fn: function get(req, res) {
			var Service = req.models.Service,
				limit = req.query.limit || 250;
			if (limit > 250) {
				return res.badRequest('You cannot get more than 250 results');
			}
			async.waterfall([
				function getSubscribers(next) {
					Service.findAndCountAll({
						where: {
							user_id: req.params.userid
						},
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
	publish: {
		path: '/dev/:userid/service',
		description: 'publish service',
		method: 'put',
		params: {
		},
		// hooks: [ auth.isLoggedIn() ],
		fn: function add(req, res) {
			async.waterfall([
				function (next) {
					var form = new multiparty.Form();
					form.parse(req, function(err, fields, files) {
						if (err) { return next({ error: err, code: 'INVALID_REQUEST'}); }
						var archivePath = files.archive[0].path;
						return next(null, archivePath, req.query.application);
					});
				}
			], function (err, archivePath, application) {
				if (err) { return res.error(err); }
				typeof application === 'string' && (application = JSON.parse(application));
				req.models.Service.publish({
					archivePath: archivePath,
					user_id: req.params.userid,
					package: application
				}).then(res.ok, res.error);
			});
		}
	}
}