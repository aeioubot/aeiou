const reactDB = require('./models/creact.js');


module.exports = {
	creact: async (msg) => {
		if (msg.author.bot || msg.channel.type != 'text') return;
		const reactionObjects = reactDB.allGuildReactions[msg.guild.id] || [];
		const toSay = reactionObjects.find((reactObject) => {
			if (msg.content.toLowerCase() === reactObject.trigger) return reactObject;
		});
		if (toSay) {
			if (msg.content === msg.content.toUpperCase() && toSay.content.indexOf('<') === -1 && toSay.content.indexOf('>') === -1) return msg.channel.send(toSay.content.toUpperCase());
			return msg.channel.send(toSay.content);
		}
	},
};
