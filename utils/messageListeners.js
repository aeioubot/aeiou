const plants = require('./models/plants.js');
const CRManager = require('./classes/cr/CRManager');

module.exports = {
	creact: async (msg) => {
		if (
			msg.author.bot ||
			msg.channel.type != 'text' || // Exit conditions for no CR.
			msg.client.provider.get(msg.guild, 'ignoredChannels', []).includes(msg.channel.id) ||
			!msg.content
		) return;
		CRManager.processMessage(msg);
	},
	plantSeed: async (msg) => {
		if (Math.floor(Math.random() * 600) !== 0 || !msg.guild || msg.client.provider.get(msg.guild.id, 'noSeedChannels', []).includes(msg.channel.id)) return;
		msg.react('🌰')
			.then(() => {
				setTimeout(async () => {
					let earners;
					try {
						earners = Array.from(msg.reactions.get('🌰').users.keys());
					} catch (e) {
						return; // Protection against message deletion.
					}
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
			.catch((e) => {
				if (e.message == 'Reaction blocked') return;
				const m = msg.client.provider.get(msg.guild.id, 'noSeedChannels', []);
				m.push(msg.channel.id);
				msg.client.provider.set(
					msg.guild.id,
					'noSeedChannels',
					m
				);
			});
	},
};
