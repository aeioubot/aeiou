const reactDB = require('./models/creact.js');
const plants = require('./models/plants.js');


module.exports = {
	creact: async (msg) => {
		if (msg.author.bot || msg.channel.type != 'text') return;
		const reactionObjects = await reactDB.getReacts(msg);
		const toSay = reactionObjects.find(reactObject => {
			if (msg.content.toLowerCase() === reactObject.trigger) return reactObject;
		});
		if (toSay) return msg.channel.send(toSay.content);
	},
	plantSeed: async (msg) => {
		if (Math.floor(Math.random() * 200) !== 0 || msg.client.provider.get(msg.guild.id, 'noSeedChannels', []).includes(msg.channel.id)) return;
		msg.react("🌰");
		setTimeout(() => {
			const earners = Array.from(msg.reactions.get('🌰').users.keys());
			msg.react('⏰');
			earners.splice(earners.indexOf(msg.client.user.id), 1);
			earners.forEach((userID) => {
				plants.getPlant(userID).then(plantClass => {
					plantClass.addToSeeds({
						name: `Seed dropped by ${msg.member.displayName}`,
						growthRate: Math.floor(Math.random() * 10) + 11,
						leafiness: Math.floor(Math.random() * 15) + 16,
						sleepChance: 60,
						waterAffinity: 5,
					}).then((added) => {
						plants.storePlant(plantClass);
					});
				});
			});
		}, 10000);
	},
};
