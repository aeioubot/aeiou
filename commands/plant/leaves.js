const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'leaves',
			group: 'plant',
			memberName: 'leaves',
			description: 'Shows how many leaves you have.',
			details: 'Shows how many leaves you have.',
			examples: ['leaves'],
			guildOnly: true,
		});
	}

	async run(msg) {
		return plants.getPlant(msg).then((plantClass) => {
			return msg.say(`You have **${plantClass.getPlantData().leaves}** leaves. :leaves:`);
		});
	}
};
