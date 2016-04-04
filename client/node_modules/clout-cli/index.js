/**
 * Clout CLI
 */
var package = require('./package.json'),
	program = require('electron')('clout'),
	Args = require('electron/lib/electron/args'),
	debug = require('debug')('clout:base');

var clout = module.exports;

clout.program = program;
clout.package = package;

(function initialize() {
	/**
	 * Define your program settings
	 */
	program
		.name('Clout CLI')
		// .theme('clean')
		.desc(package.description)
		.version(package.version);

	/**
	 * Load Help Commmands
	 */
	program
		.command('help')
		.desc('command information')
		.action(program.showHelp);

	program
		.command('default')
		.action(function () {
			program.showHelp();
		});

	program
	.command('absent')
	.action(function (argv) {
		console.error('Should you be here?'.red);
	});

	(require('./lib/config'))(clout); // Load Configuration
	(require('./lib/commands'))(clout); // Load Commands

	/**
	 * Execute program
	 */
	program.parse();
})();