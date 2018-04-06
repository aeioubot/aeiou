const Sequelize = require('sequelize');
const Database = require('../../database.js');
const crypto = require('crypto');

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
	gangDescription: {
		type: Sequelize.TEXT,
		defaultValue: 'This gang doesn\'t have a description.',
	},
	gangColor: {
		type: Sequelize.STRING,
		defaultValue: 'FFFFFF',
	},
	gangImage: {
		type: Sequelize.TEXT,
	},
	gangMembers: {
		type: Sequelize.TEXT,
	},
	biggestBetrayCount: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
	biggestBetrayName: {
		type: Sequelize.TEXT,
	},
	totalBetrays: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
});

module.exports = {
	newGang: function(msg, name, description) {
		return gangs.upsert({
			user: msg.author.id,
			gangCode: crypto.createHash('whirlpool').update(`${new Date().getTime()}${msg.author.id}`).digest('hex').slice(0, 10),
			gangName: name,
			gangDescription: description,
			gangImage: '',
			gangMembers: '[]',
		});
	},
	findGangByCode: function(code) {
		code = code.toLowerCase().replace(/[^a-z0-9]/g, '');
		return gangs.findOrCreate({
			where: {
				gangCode: gangCode,
			},
		}).then((returnedData) => returnedData[0].dataValues);
	},
	findGangByUser: function(user) {
		return gangs.findOne({
			where: {user: user.author.id},
		}).then((returnedData) => returnedData.dataValues);
	},
	updateGang: function(user, gang) {
		return table.update(modifiedRow, {where: {user: user.author.id}});
	},
};
