const Sequelize = require('sequelize');
const Database = require('../../database.js');

const db = Database.db;

const gangs = db.define('gangs', {
	user: {
		// eslint-disable-next-line
		type: Sequelize.STRING(25),
		unique: true,
	},
	gangCode: {
		// eslint-disable-next-line
		type: Sequelize.TEXT,
	},
	gangName: {
		type: Sequelize.TEXT,
	},
	gangPhrase: {
		type: Sequelize.TEXT,
		defaultValue: 'This gang doesn\'t have a description.',
	},
	gangImage: {
		type: Sequelize.TEXT,
	},
	gangMembers: {
		type: Sequelize.TEXT,
		defaultValue: '[]',
	},
	biggestBetrayCount: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
	biggestBetrayName: {
		type: Sequelize.TEXT,
	},
});

module.exports = {
	newCircle: function() {
		gangs.findAll();
	},
};
