const reactDB = require('./models/creact.js');
const plants = require('./models/plants.js');

function upify(msgContent) {
	msgContent = msgContent.split('');
	let upping = true;
	for (let i = 0; i < msgContent.length; i++) {
		if (upping) msgContent[i] = msgContent[i].toUpperCase();
		if (msgContent[i] == '<') upping = false;
		if (msgContent[i] == '>') upping = true;
	}
	return msgContent.join('');
}

module.exports = {
	creact: async (msg) => {
		if (msg.author.bot || msg.channel.type != 'text' || msg.client.provider.get(msg.guild, 'ignoredChannels', []).includes(msg.channel.id)) return;
		const reactionObjects = reactDB.allGuildReactions[msg.guild.id] || [];
		let markdownStart = '';
		for (let i = 0; msg.content[i] === msg.content.split('').reverse().join('')[i] && '`*_~'.includes(msg.content[i]); i++) markdownStart += msg.content[i];
		let messageContent = msg.content.substr(markdownStart.length, msg.content.length - (2 * markdownStart.length));
		let toSay = reactionObjects.find((reactObject) => messageContent.toLowerCase() === reactObject.trigger);
		if (toSay) {
			let reactContent = (messageContent === upify(messageContent) && toSay.trigger !== upify(toSay.trigger)) ? toSay.content.toUpperCase() : toSay.content;
			return msg.channel.send(markdownStart + reactContent + markdownStart.split('').reverse().join(''));
		}
	},
	plantSeed: async (msg) => {
		if (Math.floor(Math.random() * 600) !== 0 || msg.client.provider.get(msg.guild.id, 'noSeedChannels', []).includes(msg.channel.id)) return;
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
