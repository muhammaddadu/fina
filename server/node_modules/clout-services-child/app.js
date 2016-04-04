/**
 * Clout Auth Server
 */
var clout = require('clout-js'),
	Docker = require('dockerode'),
	debug = require('debug')('app');

var fs = require('fs'),
	spawn = require('child_process').spawn;

clout.docker = new Docker();

clout.docker.buildImageLocal = function buildImageLocal(dir, opts, callback) {
	if (!fs.lstatSync(dir).isDirectory()) {
		return callback('path `' + dir + '` is not a directory');
	}
	var args = ['build'];
	for (var key in opts) {
		args.push('-' + key);
		args.push(opts[key]);
	}
	args.push(dir);
	debug('[CMD] docker ' + args.join(' '));
	var spawnProc = spawn('docker', args, {} || {}),
		stdout = '',
		stderr = '';

	spawnProc.stdout.on('data', function (chunk) {
		stdout += chunk;
	});
	spawnProc.stderr.on('data', function (chunk) {
		stderr += chunk;
	});
	spawnProc.on('error', function (chunk) {
		stderr += chunk;
	});
	spawnProc.on('close', function (code) {
		if (code !== 0) {
			return callback('child process exited with code ' + code + '\n' + stderr);
		}
		callback(null, stdout.trim());
	});
}

clout.on('started', function () {
	if (clout.server.https) {
		console.info('http server started on port %s', clout.server.https.address().port);
	}
	if (clout.server.http) {
		console.info('http server started on port %s', clout.server.http.address().port);
	}
});

clout.app.use(function (req, res, next) {
	req.docker = clout.docker;
	next();
});

clout.start();
