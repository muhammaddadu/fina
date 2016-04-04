/**
 * Default Application Configuration
 */
var path = require('path');

module.exports = {
	session: {
		secret: '<SESSION_SECRET>'
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