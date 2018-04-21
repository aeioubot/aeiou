const Sequelize = require('sequelize');
const Database = require('../../database.js');

const db = Database.db;

const reacts = db.define('reacts', {
	guild: {
		type: Sequelize.STRING(25), // eslint-disable-line
	},
	trigger: {
		type: Sequelize.STRING(2000), // eslint-disable-line
	},
	content: {
		type: Sequelize.STRING(2000), // eslint-disable-line
	},
}, {timestamps: false, charset: 'utf8mb4'});

const allReacts = {};

module.exports = {
	addReact: async (msg, trigger, content) => {
		return reacts.upsert({
			guild: msg.guild.id,
			trigger: trigger,
			content: content,
		});
	},
	deleteReact: async (msg, trigger) => {
		return reacts.find({
			where: {
				guild: msg.guild.id,
				trigger: trigger,
			},
		}).then((result) => {
			if (result) { // cr trigger exists -> delete.
				reacts.destroy({
					where: {
						guild: msg.guild.id,
						trigger: trigger,
					},
				});
			};
		});
	},
	editReact: async (msg, trigger, content) => {
		return reacts.find({
			where: {
				guild: msg.guild.id,
				trigger: trigger,
			},
		}).then((result) => {
			if (result) { // cr trigger exists -> edit.
				reacts.update({
					trigger: trigger,
					content: content,
				}, {
					where: {
						guild: msg.guild.id,
						trigger: trigger,
					},
				});
			}
		});
	},
	findReact: (msg, trigger) => { // from cache
		if (!allReacts) return null;
		if (!allReacts[msg.guild.id]) return null;
		return allReacts[msg.guild.id].find((react) => {
			return react.trigger === trigger;
		});
	},
	findAllForGuild: (guild) => { // from cache
		return allReacts[guild] || [];
	},
	addToCache: async function(toAdd) {
		allReacts[toAdd.guild] = allReacts[toAdd.guild] || [];
		allReacts[toAdd.guild].push({trigger: toAdd.trigger, content: toAdd.content});
	},
	removeFromCache: async function(toRemove) {
		allReacts[toRemove.guild] = allReacts[toRemove.guild] || [];
		allReacts[toRemove.guild].splice(allReacts[toRemove.guild].findIndex((reaction) => reaction.trigger === toRemove.trigger), 1);
	},
	editInCache: async function(toEdit) {
		allReacts[toEdit.guild] = allReacts[toEdit.guild] || [];
		allReacts[toEdit.guild].find((reaction) => reaction.trigger === toEdit.trigger).content = toEdit.content;
	},
	buildReactCache: async function(guildArray, shardID) {
		return reacts.findAll().then((returnedData) => {
			let count = 0;
			returnedData = returnedData.map((r) => r.dataValues);
			returnedData = returnedData.forEach((reaction) => {
				if (guildArray.includes(reaction.guild)) {
					if (!allReacts[reaction.guild]) allReacts[reaction.guild] = [];
					allReacts[reaction.guild].push({ trigger: reaction.trigger, content: reaction.content });
					count += 1;
				}
			});
			console.log(`[Shard ${shardID}] Cached ${count} reactions for ${guildArray.length} guilds!`);
		});
	},
};
