const CustomReaction = require('./CustomReaction.js');

class CRManager {
	constructor() {
		this.allGuilds = {};
	}

	getGuildReactions(guild) {
		if (!guild) throw new Error('A guild ID must be provided.');
		if (!this.allGuilds[guild]) this.allGuilds[guild] = [];
		return this.allGuilds[guild];
	}

	addReaction(guild, type, trigger, content) {
		const findTest = this.getGuildReactions(guild).find(cr => trigger.toLowerCase() === cr.getTrigger().toLowerCase());
		if (!findTest) return this.getGuildReactions(guild).push(new CustomReaction(type, trigger, content));
		return findTest.addAltContent(content); // Find a reaction with a matching trigger, if it doesnt exist make it, if it does add alt. cont
	}

	deleteReaction(msg, trigger, index) {
		if (index !== 0 && !index) throw new Error('An index must be provided to delete a CR');
		const saved = this.getGuildReactions(msg.guild.id).find(d => d.trigger.toLowerCase() === trigger.toLowerCase());
		if (!saved) return {success: false, text: null};
		if (saved.getContents().length === 0) this.getGuildReactions(msg.guild.id).splice(this.getGuildReactions(msg.guild.id).indexOf(saved));
		if (saved) {
			const spliced = saved.getContents().splice(index, 1)[0];
			return {
				success: spliced ? true : false,
				text: spliced,
			};
		}
		return {
			success: false,
			text: null,
		};
	}

	deleteTrigger(msg, trigger) {
		const saved = this.getGuildReactions(msg.guild.id).find(d => d.trigger.toLowerCase() === trigger.toLowerCase());
		if (!saved) return {success: false};
		this.getGuildReactions(msg.guild.id).splice(this.getGuildReactions(msg.guild.id).indexOf(saved));
		return {success: true};
	}

	processMessage(msg) {
		for (const cr of this.getGuildReactions(msg.guild.id)) if (cr.isMatch(msg)) return cr.react(msg);
		return null;
	}
}
global.meme = new CRManager();
module.exports = global.meme;
