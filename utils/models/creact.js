const Sequelize = require('sequelize');
const Database = require('../../database.js');

const db = Database.db;

const guildReacts = db.define('guildReacts', {
	guild: {
		// eslint-disable-next-line
		type: Sequelize.STRING(25),
		unique: true,
	},
	reactObjects: {
		type: Sequelize.TEXT,
		defaultValue: '[]',
	},
}, {
	charset: 'utf8mb4',
});

module.exports = {
	setReacts: async (msg, reactObjects) => {
		return guildReacts.upsert({
			guild: msg.guild.id,
			reactObjects: JSON.stringify(reactObjects),
		});
	},
	getReacts: async (msg) => {
		return guildReacts.findOrCreate({
			where: {
				guild: msg.guild.id,
			},
		}).then((returnedData) => JSON.parse(returnedData[0].dataValues.reactObjects));
	},
	allGuildReactions: {},
	addToCache: async function(guildID, crObject) {
		const gr = this.allGuildReactions[guildID] || [];
		gr.push(crObject);
	},
	removeFromCache: async function(guildID, trigger) {
		const gr = this.allGuildReactions[guildID] || [];
		gr.splice(gr.findIndex((crObject) => crObject.trigger == trigger), 1);
	},
	buildReactCache: async function(msg) {
		return guildReacts.findAll().then((returnedData) => {
			returnedData.map((guildReactions) => {
				this.allGuildReactions[guildReactions.dataValues.guild] = JSON.parse(guildReactions.dataValues.reactObjects);
			});
		});
	},
	appendToReacts: async function(msg, reactObject) {
		return this.getReacts(msg).then((reactArray) => {
			reactArray.push(reactObject);
			this.setReacts(msg, reactArray);
		});
	},
};
