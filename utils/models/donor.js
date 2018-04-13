const Sequelize = require('sequelize');
const Database = require('../../database.js');

const db = Database.db;

const guildDonors = db.define('guildDonors', {
	guild: {
		// eslint-disable-next-line
		type: Sequelize.STRING(25),
		unique: true,
	},
	donors: {
		type: Sequelize.TEXT,
		defaultValue: '[]',
	},
}, {timestamps: false, charset: 'utf8mb4'});

module.exports = {
	setDonors: async (msg, donors) => {
		guildDonors.upsert({
			guild: msg.guild.id,
			donors: JSON.stringify(donors),
		});
	},
	getDonors: async (msg) => {
		return guildDonors.findOrCreate({
			where: {
				guild: msg.guild.id,
			},
		}).then((returnedData) => JSON.parse(returnedData[0].dataValues.donors));
	},
};
