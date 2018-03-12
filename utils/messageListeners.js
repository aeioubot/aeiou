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
		// Define the variable used to keep track of the markdown the user uses at the start and end of their message.
		let markdownStart = '';
		// Run a loop to add the user's markdown (which can contain *, _ and ~ characters) to the markdownStart variable.
		// This will keep running until the markdown at the start of the message is different from the markdown at the end of the message reversed.
		for (i = 0; msg.content[i] == msg.content[msg.content.length - i - 1] && '*_~'.indexOf(msg.content[i]) > -1; i++) {
			// Add the markdown character to the markdownStart variable.
			markdownStart += msg.content[i];
		}
		// This variable holds the actual custom reaction trigger, without the markdown the user uses.
		let triggerContent = msg.content.substr(i, msg.content.length - (2 * i));
		// Find the response for the trigger.
		let toSay = reactionObjects.find((reactObject) => triggerContent.toLowerCase() === reactObject.trigger);
		if (toSay) {
			// If the triggerContent is the same as the triggerContent to upper case, send the response in uppercase too.
			let reactContent = (triggerContent === upify(triggerContent)) ? toSay.content.toUpperCase() : toSay.content;
			// Send the custom reaction with the user's markdown around it.
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
