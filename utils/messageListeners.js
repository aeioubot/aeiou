const reactDB = require('./models/creact.js');
const plants = require('./models/plants.js');


module.exports = {
	creact: async (msg) => {
		if (msg.author.bot || msg.channel.type != 'text') return;
		const reactionObjects = reactDB.allGuildReactions[msg.guild.id] || [];
		const toSay = reactionObjects.find((reactObject) => {
			if (msg.content.toLowerCase() === reactObject.trigger) return reactObject;
		});
		if (toSay) return msg.channel.send(toSay.content);
	},
	plantSeed: async (msg) => {
		if (Math.floor(Math.random() * 400) !== 0 || msg.client.provider.get(msg.guild.id, 'noSeedChannels', []).includes(msg.channel.id)) return;
		msg.react('🌰')
			.then(() => {
				setTimeout(async () => {
					const earners = Array.from(msg.reactions.get('🌰').users.keys());
					const errorTest = await msg.react('⏰').catch(() => 'error');
					if (errorTest == 'error') return;
					earners.splice(earners.indexOf(msg.client.user.id), 1);
					earners.forEach((userID) => {
						plants.getPlant(userID).then((plantClass) => {
							plantClass.addToSeeds({
								name: `Seed dropped by ${msg.member.displayName}`,
								growthRate: Math.floor(Math.random() * 10) + 11,
								leafiness: Math.floor(Math.random() * 15) + 16,
								sleepChance: 60,
								waterAffinity: 5,
							});
							plants.storePlant(plantClass);
						});
					});
				}, 10000);
			})
			.catch(() => msg.client.provider.set(
				msg.guild.id,
				'noSeedChannels',
				msg.client.provider.get(msg.guild.id, 'noSeedChannels', [])
			));
	},
};
