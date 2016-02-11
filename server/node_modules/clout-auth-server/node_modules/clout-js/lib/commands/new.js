/**
 * Clout CLI
 */
var _ = require('lodash'),
	debug = require('debug')('clout:new'),
	path = require('path'),
	async = require('async'),
	utils = require('../utils'),
	ejs = require('ejs'),
	fs = require('fs-extra');

var TEMPLATES_DIR = path.join(__dirname, '../../resources/templates/'),
	BASE_TEMPLATE = path.join(TEMPLATES_DIR, 'base');

module.exports = {
	command: 'new',
	desc: 'create a new service',
	ensureLoggedIn: process.env.NO_AUTH ? false : true,
	options: [
		['--name', 'service name:'],
		['--projectDir', 'Project Directory'],
		['--workspaceDir', 'Workspace Directory'],
		['-f, --force', 'Force project creation']
	],
	required: [
		{
			description: 'Service Name:',
			option: 'name',
			name: 'name',
			required: true
		}
	],
	action: function (argv) {
		var serviceName = argv.param('name'),
			serviceId = serviceName.replace(' ', '-').toLowerCase(),
			projectDir = undefined;

		debug('serviceName: %s', serviceName);
		debug('serviceId: %s', serviceId);
		// get projectDirectory
		if (argv.param('projectDir')) {
			projectDir = path.resolve(projectDir);
		} else if (argv.param('workspaceDir')) {
			projectDir = path.join(argv.param('workspaceDir'), serviceId);
		} else {
			projectDir = path.join(process.cwd(), serviceId);
		}

		debug('projectDir: %s', projectDir);

		async.series([
			// check if project already exists
			function checkIfProjectExists(next) {
				debug('projectDir exists? %s', fs.existsSync(projectDir));
				if (!fs.existsSync(projectDir)) {
					return next();
				}
				console.warn('Project already exists'.yellow);
				if (argv.mode('force', 'f')) {
					console.warn('Forcing project creation'.yellow);
					return next();
				}
				prompt.get([{
					description: 'Would you like to overide the existing project:',
					option: 'force',
					name: 'force'
				}], function (err, result) {
					if (!result) {
						// probably a SIGKILL
						console.log('');
						return;
					}
					if (!!result.force && ['y', 'Y', 'yes', 'YES', 'true', 'TRUE', 't', 'T'].indexOf(result.force) > -1) {
						// carry on
						return next();
					}
					console.error('Project could not be created :('.red);
				});
				prompt.start();
			},
			// create Project in directory
			function copyBaseProjectAndRender(next) {
				debug('copySync BASE_TEMPLATE: %s -> projectDir', BASE_TEMPLATE);
				fs.copySync(BASE_TEMPLATE, projectDir);
				var EJSData = {
					serviceName: serviceName,
					serviceId: serviceId,
					author: user ? user.firstName + ' ' + user.lastName : 'Muhammad Dadu'
				};
				debug('EJSData: %s', JSON.stringify(EJSData));
				utils.getGlobbedFiles(projectDir + '/**/*.ejs').forEach(function load(filePath) {
					var file = fs.readFileSync(filePath, 'ascii'),
						rendered = ejs.render(file, EJSData),
						newFilePath = filePath.replace('.ejs', '');
					fs.writeFileSync(newFilePath, rendered);
					fs.removeSync(filePath);
				});
				next();
			},
			// create MYSQL Service
			function (next) { next(); },
			// add basic angular example
			function (next) { next(); },
			function (next) {
				var cloutConf_json = {
					nodes: 1
				};
				fs.writeFileSync(path.join(projectDir, 'cloutConf.json'), JSON.stringify(cloutConf_json, null, '\t'));
				next();
			}
		], function (err) {
			if (err) {
				return console.error(err.red);
			}
			console.error('Project Created');
		});
	}
};