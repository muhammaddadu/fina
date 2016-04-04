/**
 * Clout CLI
 */
var _ = require('lodash'),
	fs = require('fs'),
	path = require('path'),
	request = require('request'),
	debug = require('debug')('clout:publish'),
	_ = require('lodash'),
	async = require('async'),
	archiver =  require('archiver'),
	os = require('os');

module.exports = {
	command: 'publish',
	desc: 'publish user services',
	// ensureLoggedIn: true,
	options: [
		['--name', 'service name:'],
		['--projectDir', 'Project Directory'],
		['--workspaceDir', 'Workspace Directory'],
		['-f, --force', 'Force project creation']
	],
	action: function (argv) {
		var serviceName = argv.param('name'),
			serviceId = serviceName && serviceName.replace(' ', '-').toLowerCase(),
			projectDir = undefined,
			application = {},
			packageArchive;

		var self = this;
		self.user = { id: 'fakeid' };

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
			function retriveProjectInformation(next) {
				var packageFile = path.join(projectDir, 'package.json'),
					configFile = path.join(projectDir, 'cloutConf.json'),
					config = fs.existsSync(configFile) ? require(configFile) : {},
					packageJ = fs.existsSync(packageFile) ? require(packageFile) : {};
				application = _.extend(config, packageJ);
				return next();
			},
			function packageApp(next) {
				var dirs = fs.readdirSync(projectDir),
					zipArchive = archiver('zip'),
					src = [];

				packageArchive = path.join(os.tmpdir(), 'release_' + application.version + '.zip');
				
				var output = fs.createWriteStream(packageArchive);
				
				dirs = _.without(dirs, 'node_modules');
				process.chdir(projectDir);
				dirs.forEach(function (dir) {
					if (!fs.lstatSync(dir).isDirectory()) {
						src.push(path.join(dir));
						return;
					}
					src.push(path.join(dir, '**'));
				});

				zipArchive.pipe(output);
			    zipArchive.bulk([{src: src, expand: true}]);
			    zipArchive.finalize()
			    	.on('end', function () {
				        next();
				    })
				    .on('error', function (err) {
				    	next("Error packaging application: " + err);
				    });
			},
			// upload service
			function (next) {
				var size = fs.statSync(packageArchive).size;
				debug('application:', application);
				debug('packageArchive:', packageArchive);
				debug('size:', size);
				debug('uploading...');
				request({
					method: 'PUT',
				    preambleCRLF: true,
				    postambleCRLF: true,
					uri: $config.servicesUrl + '/api/dev/' + self.user.id + '/service?application=' + JSON.stringify(application),
					multipart: [
						{ 
					        'Content-Disposition' : 'name="archive"; filename="archive.zip"',
					        'Content-Type' : 'application/octet-stream',
					        // 'Content-Length': size,
					        body: fs.createReadStream(packageArchive)
					    }
					],
					headers: {
						'User-Agent': 'cloutCLI',
						'X-Auth-Token': $config.user.token,
						// 'Content-Length': size
					},
					json: true,
					alive: true
				}, function (err, resp, body) {
					if (err) { return next(err); }
					if (!body || !body.success) {
						return next(JSON.stringify(body));
					}
					console.log('body:', body);
					if (body .data&& body.data.host && body.data.port) {
						console.log('Service started at:', body.data.host + ':' + body.data.port);
					}
					next();
				});
			}
		], function (err) {
			if (err) { return console.error(String(err).red); }
			console.log('Service Published');
		});
	}
};