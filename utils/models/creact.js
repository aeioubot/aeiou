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
}, {charset: 'utf8mb4'});

let allReactions = {};

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
		if (!allReactions) return null;
		if (!allReactions[msg.guild.id]) return null;
		return allReactions[msg.guild.id].find((react) => {
			return react.trigger === trigger;
		});
	},
	findAllForGuild: (guild) => { // from cache
		return allReactions[guild] || [];
	},
	addToCache: async function(reactionToAdd) {
		allReactions[reactionToAdd.guild] = allReactions[reactionToAdd.guild] || [];
		allReactions[reactionToAdd.guild].push({trigger: reactionToAdd.trigger, content: reactionToAdd.content});
	},
	removeFromCache: async function(reactionToRemove) {
		allReactions[reactionToRemove.guild] = allReactions[reactionToRemove.guild] || [];
		allReactions.splice(allReactions.findIndex((reaction) => reaction.trigger === reactionToRemove.trigger), 1);
	},
	editInCache: async function(reactionToEdit) {
		allReactions[reactionToEdit.guild] = allReactions[reactionToEdit.guild] || [];
		allReactions[reactionToEdit.guild].find((reaction) => reaction.trigger === reactionToEdit.trigger).content = reactionToEdit.content;
	},
	buildReactCache: async function(guildArray, shardID) {
		return reacts.findAll().then((returnedData) => {
			let temp = {};
			let count = 0;
			returnedData = returnedData.map((r) => r.dataValues);
			returnedData = returnedData.forEach((reaction) => {
				if (guildArray.includes(reaction.guild)) {
					if (!temp[reaction.guild]) temp[reaction.guild] = [];
					temp[reaction.guild].push({ trigger: reaction.trigger, content: reaction.content });
					count++;
				}
			});
			allReactions = temp;
			console.log(`[Shard ${shardID}] Cached ${count} reactions for ${guildArray.length} guilds!`);
		});
	},
};
