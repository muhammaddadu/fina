/**
 * Clout Auth Server
 */
var clout = require('clout-js');

clout.on('started', function () {
	if (clout.server.https) {
		console.info('http server started on port %s', clout.server.https.address().port);
	}
	if (clout.server.http) {
		console.info('http server started on port %s', clout.server.http.address().port);
	}
});

clout.start();