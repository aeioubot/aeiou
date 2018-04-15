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
}, {charset: 'utf8mb4'});

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
	replaceInCache: async function(guildID, trigger, content) {
		const gr = this.allGuildReactions[guildID] || [];
		gr.find(x => x.trigger == trigger).content = content;
	},
	buildReactCache: async function(guildArray, shardID) {
		const temp = {};
		return guildReacts.findAll()
			.then((returnedData) => {
				returnedData.forEach(i => temp[i.guild] = JSON.parse(i.reactObjects));
				return;
			})
			.then(() => {
				guildArray.forEach((id) => {
					this.allGuildReactions[id] = temp[id];
				});
			})
			.then(() => console.log(`[Shard ${shardID}] Cached reactions for ${guildArray.length} guilds!`));
	},
	appendToReacts: async function(msg, reactObject) {
		return this.getReacts(msg).then((reactArray) => {
			reactArray.push(reactObject);
			this.setReacts(msg, reactArray);
		});
	},
};
