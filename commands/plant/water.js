const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'water',
			group: 'plant',
			memberName: 'water',
			description: 'Waters your plant.',
			details: 'Waters your plant.',
			examples: ['water'],
			guildOnly: true,
		});
	}

	async run(msg) {
		const userPlant = await plants.getPlant(msg);
		if (!userPlant.getPlantData().activeSeed) return msg.say("You water the soil... I guess. :shower:");
		if (userPlant.getPlantData().activeSeed.watered) return msg.say("Your plant is already watered.");
		userPlant.getPlantData().activeSeed.watered = true;
		return plants.storePlant(userPlant).then(() => msg.say("Your plant was watered. :shower:"));
	}
};
