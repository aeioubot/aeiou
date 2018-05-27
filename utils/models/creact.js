const Sequelize = require('sequelize');
const {Op} = require('sequelize');
const Database = require('../../database.js');
const CRManager = require('../classes/cr/CRManager');

//                                              NOTE
// While creact.js (here) manages the connection between inputs, the CR cache, and the CR database,
// ../classes/cr/CRManager is the class that serves as the cache and the holder for this live state

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
	type: {
		type: Sequelize.STRING(20), // eslint-disable-line
	},
}, {timestamps: false, charset: 'utf8mb4'});

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
	// findReact: (msg, trigger) => { // from cache
	// 	if (!allReacts) return null;
	// 	if (!allReacts[msg.guild.id]) return null;
	// 	return allReacts[msg.guild.id].find((react) => {
	// 		return react.trigger === trigger;
	// 	});
	// },
	// findAllForGuild: (guild) => { // from cache
	// 	return allReacts[guild] || [];
	// },
	// addToCache: async function(toAdd) {
	// 	allReacts[toAdd.guild] = allReacts[toAdd.guild] || [];
	// 	allReacts[toAdd.guild].push({trigger: toAdd.trigger, content: toAdd.content});
	// },
	// removeFromCache: async function(toRemove) {
	// 	allReacts[toRemove.guild] = allReacts[toRemove.guild] || [];
	// 	allReacts[toRemove.guild].splice(allReacts[toRemove.guild].findIndex((reaction) => reaction.trigger === toRemove.trigger), 1);
	// },
	// editInCache: async function(toEdit) {
	// 	allReacts[toEdit.guild] = allReacts[toEdit.guild] || [];
	// 	allReacts[toEdit.guild].find((reaction) => reaction.trigger === toEdit.trigger).content = toEdit.content;
	// },
	buildReactCache: async function(guildArray, shardID) {
		return reacts.findAll({
			where: {
				guild: {
					[Op.or]: guildArray,
				},
			},
		}).then((returnedData) => {
			let count = 0;
			returnedData.forEach((reaction) => { // ya yeet not whole notice
				CRManager.addReaction(reaction.guild, reaction.type, reaction.trigger, reaction.content);
				count += 1;
			});
			return count;
		});
	},
};
