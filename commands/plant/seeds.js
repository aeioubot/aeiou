const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'seeds',
			group: 'plant',
			memberName: 'seeds',
			description: 'The command to play with all your seeds.',
			details: 'The command to view and interact with all your seeds.',
			examples: ['!seeds', '!seeds view 9'],
			format: '[option] [arguments]',
			guildOnly: true,
		});
	}

	async run(msg) {
		let textContent = ['The seeds you own are:', '```json'];
		const plantClass = await plants.getPlant(msg);
		plantClass.getPlantData().seeds.forEach((seed, index) => {
			textContent.push(`[${index}]  ${seed.name}`);
		});
		if (textContent.length == 2) return msg.say('You don\'t have any seeds in your pouch. Try using `!dig` to find one.');
		textContent.push('```');
		msg.say(textContent.join('\n'));
	}
};
