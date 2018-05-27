const CustomReaction = require('./CustomReaction.js');

class CRManager {
	constructor() {
		this.allGuilds = {};
	}

	getGuildReactions(guild) {
		if (!this.allGuilds[guild]) this.allGuilds[guild] = [];
		return this.allGuilds[guild];
	}

	addReaction(guild, type, trigger, content) {
		const findTest = this.getGuildReactions(guild).find(cr => trigger.toLowerCase() === cr.getTrigger().toLowerCase());
		if (!findTest) return this.getGuildReactions(guild).push(new CustomReaction(type, trigger, content));
		return findTest.addAltContent(content); // Find a reaction with a matching trigger, if it doesnt exist make it, if it does add alt. cont
	}

	processMessage(msg) {
		for (const cr of this.getGuildReactions(msg.guild.id)) if (cr.isMatch(msg)) return cr.react(msg);
	}
}
global.meme = new CRManager();
module.exports = global.meme;
