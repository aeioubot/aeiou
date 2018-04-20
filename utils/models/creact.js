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

let allReactions = [];

module.exports = {
	addReact: async (msg, trigger, content) => {
		return reacts.find({
			where: {
				guild: msg.guild.id,
				trigger: trigger,
			},
		}).then((result) => {
			if (result) { // cr trigger exists -> reply wuhwuh.
				return {
					found: true,
					added: false,
				};
			} else {
				// cr trigger does not exist -> add
				reacts.upsert({
					guild: msg.guild.id,
					trigger: trigger,
					content: content,
				}).then((res) => {
					return {
						found: false,
						added: true,
					};
				});
			};
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
					}
				}).then((res) => {
					return {
						found: true,
						deleted: true,
					}
				})
			} else {
				// cr trigger does not exist -> reply wuhwuh.
				return {
					found: false,
					deleted: false,
				}
			};
		});
	},
	editReact: async (msg, trigger, content) => {
		reacts.find({
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
				}).then((res) => {
					return {
						found: true,
						edited: true,
					};
				});
			} else {
				// cr trigger does not exist -> reply wuhwuh.
				return {
					found: false,
					edited: false,
				};
			};
		});
	},
	findReact: async (msg, trigger) => { // from cache
		if (!allReactions) return null;
		let found = allReactions.find((react) => {
			return react.guild === msg.guild.id && react.trigger === trigger;
		});
		if (!found || found.length < 1) return null;
		return found[0];
	},
	findAllForGuild: (guild) => { // from cache
		return allReactions.filter((react) => react.guild === guild);
	},
	allReactions: [],
	addToCache: async function(reactionToAdd) {
		allReactions.push(reactionToAdd);
	},
	removeFromCache: async function(reactionToRemove) {
		allReactions.splice(allReactions.findIndex((reaction) => reaction.trigger === reactionToRemove.trigger), 1)
	},
	editInCache: async function(reactionToEdit) {
		allReactions.find((reaction) => reaction.trigger === reactionToEdit.trigger).content = reactionToEdit.content;
	},
	buildReactCache: async function(guildArray, shardID) {
		return reacts.findAll().then((returnedData) => {
			returnedData = returnedData.map((r) => r.dataValues);
			returnedData = returnedData.filter((reaction) => {
				return guildArray.includes(reaction.guild);
			});
			allReactions = returnedData;
			console.log(`[Shard ${shardID}] Cached ${allReactions.length} reactions for ${guildArray.length} guilds!`);
		});
	},
};
