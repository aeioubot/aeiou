const Sequelize = require('sequelize');
const Database = require('../../database.js');

const db = Database.db;

const chains = db.define('chains', {
	guild: {
		// eslint-disable-next-line
		type: Sequelize.STRING(25),
		unique: true,
	},
	chainOwner: {
		// eslint-disable-next-line
		type: Sequelize.STRING(25),
	},
	chainLength: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
	chainContent: {
		// eslint-disable-next-line
		type: Sequelize.STRING(1800),
	},
});

module.exports = {
	setChain: async (msg, chainLength, chainContent) => {
		return chains.upsert({
			guild: msg.guild.id,
			chainOwner: msg.author.id,
			chainLength: chainLength,
			chainContent: chainContent,
		});
	},
	getChain: async (msg) => {
		return chains.findOrCreate({
			where: {
				guild: msg.guild.id,
			},
		}).then((returnedData) => returnedData[0]);
	},
};
