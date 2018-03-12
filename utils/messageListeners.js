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
		let i = 0;
		let markdownStart = '';
		while (msg.content[i] == msg.content[msg.content.length - i - 1] && '*_~'.indexOf(msg.content[i]) > -1) {
			markdownStart += msg.content[i];
			i++;
		}
		console.log([i, msg.content, msg.content.length - i]);
		let triggerContent = msg.content.substr(i, msg.content.length - (2 * i));
		console.log(triggerContent);
		let toSay = reactionObjects.find((reactObject) => {
			if (triggerContent.toLowerCase() === reactObject.trigger) return reactObject;
		});
		if (toSay) {
			let reactContent = (triggerContent === upify(triggerContent)) ? toSay.content.toUpperCase() : toSay.content;
			return msg.channel.send(markdownStart + reactContent + markdownStart.split('').reverse().join(''));
		}
	},
	plantSeed: async (msg) => {
		if (Math.floor(Math.random() * 600) !== 0 || msg.client.provider.get(msg.guild.id, 'noSeedChannels', []).includes(msg.channel.id)) return;
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
