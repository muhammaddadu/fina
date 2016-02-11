/**
 * Clout CLI
 */
var _ = require('lodash'),
	debug = require('debug')('clout:publish'),
	path = require('path'),
	async = require('async'),
	utils = require('../utils'),
	fs = require('fs-extra');

module.exports = {
	command: 'publish',
	desc: 'publish service',
	ensureLoggedIn: true,
	options: [
		['--name', 'service name:'],
		['--projectDir', 'Project Directory'],
		['--workspaceDir', 'Workspace Directory'],
		['-f, --force', 'Force project creation']
	],
	action: function (argv) {
		var serviceName = argv.param('name'),
			serviceId = serviceName && serviceName.replace(' ', '-').toLowerCase(),
			projectDir = undefined;

		debug('serviceName: %s', serviceName);
		debug('serviceId: %s', serviceId);
		// get projectDirectory
		if (argv.param('projectDir')) {
			projectDir = path.resolve(projectDir);
		} else if (argv.param('workspaceDir')) {
			projectDir = path.join(argv.param('workspaceDir'), serviceId);
		} else {
			projectDir = path.join(process.cwd());
		}

		debug('projectDir: %s', projectDir);

		async.series([
			// check if project already exists
			function checkIfProjectExists(next) {
				debug('projectDir exists? %s', fs.existsSync(projectDir));
				if (fs.existsSync(projectDir) && fs.existsSync(path.join(projectDir, 'cloutConf.json'))) {
					return next();
				}
				return console.error('Project not found at path `%s`'.yellow, projectDir);
			},
			function retriveProjectInformationFromClout(next) {
				return next();
				// if (argv.mode('force', 'f')) {
				// 	console.warn('Forcing project creation'.yellow);
				// 	return next();
				// }
				// Overide project on cloud
				// prompt.get([{
				// 	description: 'Would you like to overide the existing project:',
				// 	option: 'force',
				// 	name: 'force'
				// }], function (err, result) {
				// 	if (!result) {
				// 		// probably a SIGKILL
				// 		console.log('');
				// 		return;
				// 	}
				// 	if (!!result.force && ['y', 'Y', 'yes', 'YES', 'true', 'TRUE', 't', 'T'].indexOf(result.force) > -1) {
				// 		// carry on
				// 		return next();
				// 	}
				// 	console.error('Project could not be created :('.red);
				// });
				// prompt.start();
			},
			// upload service
			function (next) { next(); }
		], function (err) {
			if (err) {
				return console.error(err.red);
			}
			console.error('Service Published');
		});
	}
};