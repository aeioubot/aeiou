const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'water',
			group: 'plant',
			memberName: 'water',
			description: 'Waters your or someone else\'s plant.',
			details: 'Waters your or someone else\'s plant.',
			examples: ['water'],
			guildOnly: true,
			throttling: {usages: 1, duration: 60},
			args: [
				{
					key: 'personToWater',
					prompt: 'aaaahhhh eeeeee wooo lllll',
					type: 'member',
					default: '',
				},
			],
		});
	}

	async run(msg, {personToWater}) {
		if (!personToWater) {
			const userPlant = await plants.getPlant(msg);
			if (!userPlant.getPlantData().activeSeed) return msg.say("You water the soil... I guess. :shower:");
			if (userPlant.getPlantData().activeSeed.watered) return msg.say("Your plant is already watered.");
			userPlant.getPlantData().activeSeed.watered = true;
			return plants.storePlant(userPlant).then(() => msg.say("Your plant was watered. :shower:"));
		}
		const notMine = await plants.getPlant(personToWater.id);
		if (!notMine.getPlantData().activeSeed) return msg.say(`You water ${personToWater.displayName}'s soil... I guess. :shower:`);
		if (notMine.getPlantData().activeSeed.watered) return msg.say(`${personToWater.displayName}'s plant is already watered.`);
		notMine.getPlantData().activeSeed.watered = true;
		return plants.storePlant(notMine).then(() => msg.say(`${personToWater.displayName}'s plant was watered. :shower:`));
	}
};
