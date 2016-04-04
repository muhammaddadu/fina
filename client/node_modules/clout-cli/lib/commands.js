/**
 * Clout CLI
 */
var path = require('path'),
	fs = require('fs'),
	_ = require('lodash'),
	async = require('async'),
	utils = require('./utils'),
	debug = require('debug')('clout:commands'),
	prompt = require('prompt'),
	cloutAuthSDK = require('openstack-auth-sdk');

module.exports = function config(clout) {
	var COMMANDS_DIR = path.join(__dirname, '../commands');
	debug('COMMANDS_DIR: %s', COMMANDS_DIR);

	prompt.message = "";
	prompt.delimiter = "";

	var globPattern = COMMANDS_DIR + '**/*.js';
	utils.getGlobbedFiles(globPattern).forEach(function (filePath) {
		var commandConf = require(filePath),
			command = clout.program.command(commandConf.command).desc(commandConf.desc),
			user = null,
			token = null;
		debug('creating command `%s`: %s', commandConf.command, commandConf.desc);
		// load options
		commandConf.options && commandConf.options.forEach(function (option) {
			debug('option: %s', option);
			command.option.apply(command, option);
		});
		// we may add custom loaders for command actions
		command.action(function (argv) {
			async.series([
				function ensureLoggedIn(next) {
					if (!commandConf.ensureLoggedIn) {
						return next();
					}
					cloutAuthSDK.request.whoami($config.user.token, function (err, _user, _token) {
						if (err) {
							return next(err);
						}
						user = _user && _user.user;
						token = _token;
						next();
					});
				},
				function ensureMissingOptions(next) {
					var missingOptions = [];
					// check missing options
					commandConf.required && commandConf.required.forEach(function (required) {
						var value = argv.param.apply(argv, typeof required.option === 'string' ? [required.option] : required.option);
						if (!value) {
							missingOptions.push(required);
						}
					});

					if (missingOptions.length === 0) {
						return next();
					}

					// prompt for missing
					prompt.get(missingOptions, function (err, result) {
						if (!result) {
							// probably a SIGKILL
							console.log('');
							return;
						}
						_.merge(argv.params, result);
						next();
					});
					prompt.start();
				}
			], function (err) {
				if (err) {
					console.error(err.red);
					return;
				}
				this.prompt = prompt;
				this.user = user;
				this.token = token;
				commandConf.action.apply(this, [argv]);
			});
		});
	});
}
