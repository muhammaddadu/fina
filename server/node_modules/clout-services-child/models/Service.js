/**
 * Service Model
 */

var clout = require('clout-js'),
	Sequelize = clout.Sequelize,
	sequelize = clout.sequelize;

var Promise = require('promise'),
	debug = require('debug')('/models/Service'),
	fs = require('fs-extra'),
	_ = require('lodash'),
	path = require('path'),
	async = require('async'),
	AdmZip = require('adm-zip'),
	archiver =  require('archiver'),
	os = require('os');

const exec = require('child_process').exec;
const RESOURCES_PATH = path.join(__dirname, '..', 'resources');

if (!Sequelize) {
	return;
}

var definition = {
		name: { type: Sequelize.STRING, allowNull: false },
		user_id: { type: Sequelize.STRING, allowNull: false },
		projectDir: { type: Sequelize.STRING, allowNull: false },
		containerId: { type: Sequelize.STRING, allowNull: false },
		port: { type: Sequelize.STRING, allowNull: false },
		publicKey: { type: Sequelize.STRING, allowNull: false },
		privateKey: { type: Sequelize.STRING, allowNull: false }
	},
	props = {}
	Service = sequelize.define('Service', definition, props);

Service.publish = function publish(opts) {
	var self = this;
	return new Promise(function (resolve, reject) {
		if (!opts.archivePath || !fs.existsSync(opts.archivePath)) {
			return reject('Service archive not found');
		}
		if (!opts.user_id) {
			return reject('Missing user_id');
		}
		if (!opts.package || (!opts.package.name && !opts.package.id)) {
			return reject('Missing package information');
		}
		async.waterfall([
			function isExistingService(next) {
				var where = { user_id: opts.user_id };
				opts.package.name && (where.name = opts.package.name);
				opts.package.id && (where.id = opts.package.id);
				debug('where:', where);
				self.find({
					where: where
				}).then(function (service) {
					next(null, service);
				}, next);
			},
			function prepareProject(currentService, next) {
				// extract project
				var projectDir = path.join(os.tmpdir(), 'svc_' + String(opts.user_id), (opts.package.id || opts.package.name));
				debug('projectDir:', projectDir);
				// purge directory
				if (fs.existsSync(projectDir)) {
					fs.removeSync(projectDir);
				}
				fs.mkdirsSync(projectDir);
				// if zip archive
				if (/\.zip$/.test(opts.archivePath.toString())) {
					debug('extracting archive:', opts.archivePath);
					var zip = new AdmZip(opts.archivePath);
					zip.extractAllTo(projectDir);
					return next(null, currentService, projectDir);
				}
				// if folder
				debug('copying foler:', opts.archivePath);
				fs.copy(opts.archivePath, projectDir, function (err) {
					if (err) { return next(err); }
					return next(null, currentService, projectDir);
				});
			},
			function (currentService, projectDir, next) {
				fs.removeSync(opts.archivePath);
				return next(null, currentService, projectDir);
			},
			function loadCloutConfig(currentService, projectDir, next) {
				var cloutConfig = { projectType: 'nodeJS' },
					configPath = path.join(projectDir, 'cloutConf.json');
				fs.existsSync(configPath) && _.merge(cloutConfig, require(configPath));
				debug('cloutConfig:', cloutConfig);
				return next(null, currentService, projectDir, cloutConfig);
			},
			function configureDockerFile(currentService, projectDir, cloutConfig, next) {
				debug('projectType:', cloutConfig.projectType);
				if (cloutConfig.projectType === 'nodeJS') {
					debug('copying Dockerfile.cloutjs');
					fs.createReadStream(path.join(RESOURCES_PATH, 'Dockerfile.cloutjs'))
						.pipe(fs.createWriteStream(path.join(projectDir, 'Dockerfile')));
					return next(null, currentService, projectDir, cloutConfig);
				}
				next('Unsupported Service Type');
			},
			// function repackage(currentService, projectDir, cloutConfig, next) {
			// 	var packageArchive = path.join(os.tmpdir(), opts.user_id + '_' + (opts.package.name || opts.package.id) + '_release_' + (opts.package.version || 'null') + '.tar');
			// 	var dirs = fs.readdirSync(projectDir),
			// 		zipArchive = archiver('tar'),
			// 		src = [],
			// 		output = fs.createWriteStream(packageArchive);
			// 	dirs = _.without(dirs, 'node_modules');
			// 	process.chdir(projectDir);
			// 	dirs.forEach(function (dir) {
			// 		if (!fs.lstatSync(dir).isDirectory()) {
			// 			src.push(path.join(dir));
			// 			return;
			// 		}
			// 		src.push(path.join(dir, '**'));
			// 	});

			// 	zipArchive.pipe(output);
			//     zipArchive.bulk([{src: src, expand: true}]);
			//     zipArchive.finalize()
			//     	.on('end', function () {
			// 			next(null, currentService, packageArchive, cloutConfig);
			// 	    })
			// 	    .on('error', function (err) {
			// 	    	next('Error packaging application ' + err);
			// 	    });
			// },
			// function createImage(currentService, packagedArchive, cloutConfig, next) {
			// 	var identifier = opts.user_id + '/' + (opts.package.name || opts.package.id);
			// 	debug('identifier:', identifier);
			// 	debug('packagedArchive:', packagedArchive);
			// 	clout.docker.buildImage(packagedArchive, { t: identifier }, function (err, response) {
			// 		if (err) { debug('err:', err); return next(err); }
			// 		debug('response:', response);
			// 		console.log(response);
			// 		next('NOT_IMPLEMENTED_YET');
			// 	});
			// },
			function createImage(currentService, projectDir, cloutConfig, next) {
				var imageName = opts.user_id + '/' + (opts.package.name || opts.package.id);
				debug('imageName:', imageName);
				debug('projectDir:', projectDir);
				clout.docker.buildImageLocal(projectDir, { t: imageName }, function (err, response) {
					if (err) { debug('err:', err); return next(err); }
					debug('response:', response);
					next(null, currentService, projectDir, cloutConfig, imageName);
				});
			},
			function clearOldContainer(currentService, projectDir, cloutConfig, imageName, next) {
				if (!currentService) { return next(null, currentService, projectDir, cloutConfig, imageName); }
				debug('removing container', currentService.containerId);
				var container = clout.docker.getContainer(currentService.containerId);
				container.stop(function () {
					container.remove(function (err, response) {
						if (err && err.statusCode !== 404) { return debug('error removing container', currentService.containerId, 'err:', err); }
						currentService.destroy();
						next(null, currentService, projectDir, cloutConfig, imageName);
					});
				});
			},
			function run(currentService, projectDir, cloutConfig, imageName, next) {
				var name = (imageName + '.n1').replace('/', '-'),
					container = null,
					port = 11022;
				async.series([
					// get port
					function (go) {
						exec("netstat  -atn | perl -0777 -ne '@ports = /tcp.*?\:(\d+)\s+/imsg ; for $port (32769..61000) {if(!grep(/^$port$/, @ports)) { print $port; last } }'", function (error, stdout, stderr) {
							if (error) { return go('getPort: error:' + error); }
							if (stderr) { return go('getPort: stderr:' + stderr); }
							port = stdout.trim();
							go();
						});
					},
					// create container
					function (go) {
						debug('docker.createContainer:(Image):', imageName, '(name):', name);
						clout.docker.createContainer({
							Image: imageName,
							ExposedPorts: {"8080/tcp": {}},
							name: name
						}, function (err, _container) {
							if (err) { return go(err); }
							debug('container', _container);
							container = _container;
							container.port = port;
							go();
						});
					},
					// run container
					function (go) {
	  					container.start({
	  						"PortBindings": { "8080/tcp": [{ "HostPort": String(container.port) }]}
	  					},
	  					function (err, data) {
	  						if (err) { return go(err); }
	  						debug('container-started');
	  						go();
	  					});
					},
				], function (err) {
					if (err) { return next(err); }
					next(null, currentService, projectDir, cloutConfig, imageName, container);
				});
			},
			function registerService(currentService, projectDir, cloutConfig, imageName, container, next) {
				var toCreate = self.build({
					name: opts.package.name || 'N/A',
					user_id: opts.user_id,
					projectDir: projectDir,
					containerId: container.id,
					port: container.port,
					publicKey: 'N/A',
					privateKey: 'N/A'
				});
				toCreate.save().then(function (response) {
					next(null, response);
				}, next);
			},
		], function (err, data) {
			if (err) { debug('err', err); return reject(err); }
			resolve(data);
		});
	});
}

module.exports = Service;