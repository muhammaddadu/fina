/**
 * Development Application Configuration
 */
var path = require('path');

module.exports = {
	http: {
		port: 8082
	},
	sequelize: {
		connection: {
			storage: path.join(__dirname, '../db/default.db'),
			dialect : 'sqlite',
			dialectOptions: {
				multipleStatements: true
			},
			logging : false
		}
	}
};