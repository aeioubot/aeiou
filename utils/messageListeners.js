const reactDB = require('./models/creact.js');
const plants = require('./models/plants.js');


module.exports = {
	creact: async (msg) => {
		if (msg.author.bot || msg.channel.type != 'text' || msg.client.provider.get(msg.guild, 'ignoredChannels', []).includes(msg.channel.id)) return;
		const reactionObjects = reactDB.allGuildReactions[msg.guild.id] || [];
		const toSay = reactionObjects.find((reactObject) => {
			if (msg.content.toLowerCase() === reactObject.trigger) return reactObject;
		});
		if (toSay) {
			if (msg.content === msg.content.toUpperCase() && toSay.content.indexOf('<') === -1 && toSay.content.indexOf('>') === -1) return msg.channel.send(toSay.content.toUpperCase());
			return msg.channel.send(toSay.content).catch(() => {});
		}
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
							const color = Math.floor(Math.random() * 3);
							plantClass.addToSeeds({
								name: `Seed dropped by ${msg.member.displayName}`,
								growthRate: Math.floor(Math.random() * 10) + 11,
								leafiness: Math.floor(Math.random() * 15) + 16,
								waterAffinity: 5,
								red: color === 0 ? 255 : 0,
								green: color === 1 ? 255 : 0,
								blue: color === 2 ? 255 : 0,
							});
							plants.storePlant(plantClass);
						});
					});
				}, 10000);
			})
			.catch(() => {
				let m = msg.client.provider.get(msg.guild.id, 'noSeedChannels', []);
				m.push(msg.channel.id);
				msg.client.provider.set(
					msg.guild.id,
					'noSeedChannels',
					m
				);
			});
	},
};
