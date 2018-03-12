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

function determineMode(msgContent) {
	if (msgContent.slice(0, 3) == '***' && msgContent.slice(-3) == '***' && msgContent === msgContent.toUpperCase()) return 'boldItalicsUppercase';
	if (msgContent.slice(0, 3) == '***' && msgContent.slice(-3) == '***') return 'boldItalics';
	if (msgContent.slice(0, 2) == '**' && msgContent.slice(-2) == '**') return 'bold';
	if ((msgContent.slice(0, 1) == '*' && msgContent.slice(-1) == '*') || (msgContent.slice(0, 1) == '_' && msgContent.slice(-1) == '_')) return 'italics';
	if (msgContent === msgContent.toUpperCase()) return 'uppercase';
	return 'none';
}
translations = {
	'none': 0,
	'uppercase': 0,
	'italics': 1,
	'bold': 2,
	'boldItalics': 3,
	'boldItalicsUppercase': 3,
};

module.exports = {
	creact: async (msg) => {
		if (msg.author.bot || msg.channel.type != 'text' || msg.client.provider.get(msg.guild, 'ignoredChannels', []).includes(msg.channel.id)) return;
		const reactionObjects = reactDB.allGuildReactions[msg.guild.id] || [];
		let mode = determineMode(msg.content);
		msg.content = msg.content.substring(translations[mode], msg.content.length - translations[mode]);
		let toSay = reactionObjects.find((reactObject) => {
			if (msg.content.toLowerCase() === reactObject.trigger) return reactObject;
		});
		if (toSay) {
			if (mode === 'boldItalicsUppercase') return msg.channel.send(`***${upify(toSay.content)}***`).catch(() => {});
			if (mode === 'uppercase')            return msg.channel.send(upify(toSay.content)).catch(() => {});
			if (mode === 'boldItalics')          return msg.channel.send(`***${toSay.content}***`).catch(() => {});
			if (mode === 'bold')                 return msg.channel.send(`**${toSay.content}**`).catch(() => {});
			if (mode === 'italics')              return msg.channel.send(`_${toSay.content}_`).catch(() => {});
			return msg.channel.send(toSay.content).catch(() => {});
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
