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
		allowNull: false,
	},
}, {timestamps: false, charset: 'utf8mb4'});

function determineType(trigger) {
	trigger = trigger.toLowerCase();
	if (trigger.includes('--partial') && (trigger.match(/\{[1-9]\}/gi) || trigger.match(/\{[1-9]\}/gi))) return 'templatePartial';
	if (trigger.includes('--partial')) return 'partial';
	if ((trigger.match(/\{[1-9]\}/gi) || trigger.match(/\{[1-9]\}/gi))) return 'template';
	return 'whole';
}
module.exports = {
	addReaction: async (msg, trigger, content) => {
		CRManager.addReaction(msg.guild.id, determineType(trigger), trigger.replace('--partial', '').trim(), content);
		return reacts.create({
			guild: msg.guild.id,
			trigger: trigger.replace('--partial', '').trim(),
			content: content,
			type: determineType(trigger),
		});
	},
	deleteReaction: async (msg, trigger, index) => {
		const {success, text} = CRManager.deleteReaction(msg, trigger, index);
		if (success) {
			reacts.destroy({
				where: {
					guild: msg.guild.id,
					trigger: trigger,
					content: text,
				},
			});
			return success;
		}
		return success;
	},
	deleteTrigger: async (msg, trigger) => {
		CRManager.deleteTrigger(msg, trigger);
		return reacts.destroy({
			where: {
				guild: msg.guild.id,
				trigger: trigger,
			},
		});
	},
	getReacts(guild) {
		return CRManager.getGuildReactions(guild);
	},
	triggerExists(text, guild) {
		return CRManager.getGuildReactions(guild).find(d => d.trigger.toLowerCase() === text.toLowerCase) ? true : false;
	},
	getTriggerArray(guild) {
		return CRManager.getGuildReactions(guild).map(d => d.trigger);
	},
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
