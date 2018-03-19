const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');

module.exports = class WaterCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'water',
			group: 'plant',
			memberName: 'water',
			description: 'Waters your or someone else\'s plant.',
			details: 'Waters your or someone else\'s plant.',
			examples: ['water'],
			guildOnly: true,
			throttling: {usages: 1, duration: 300},
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
			const userPlantData = userPlant.getPlantData();
			if (!userPlantData.activeSeed) return msg.say('You water the soil... I guess. :shower:');

			if (userPlantData.activeSeed.watered && userPlantData.inventory.includes('DrainagePot')) {
				userPlantData.activeSeed.lastEvent = `You overwatered your plant, but luckily you have a drainage pot.`;
				if (Math.floor(Math.random() * 15) === 0) userPlantData.inventory.splice(userPlantData.inventory.indexOf('DrainagePot'), 1);
				return plants.storePlant(userPlant).then(() => msg.say(`You overwatered your plant, but fortunately you have a drainage pot. :shower:`));
			}

			if (userPlantData.activeSeed.watered) {
				userPlantData.progress -= Math.floor(Math.random() * 10) + 7;
				if (userPlantData.progress < 0) userPlantData.progress = 0;
				userPlantData.activeSeed.lastEvent = 'You overwated your plant, undoing some of its effort.';
				return plants.storePlant(userPlant).then(() => msg.say(`You overwatered your plant. It doesn't seem to like it. :shower:`));
			}
			userPlantData.activeSeed.watered = true;
			userPlantData.activeSeed.lastEvent = 'You watered your plant.';
			return plants.storePlant(userPlant).then(() => msg.say('Your plant was watered. :shower:'));
		}

		const notMine = await plants.getPlant(personToWater.id);
		const notMineData = notMine.getPlantData();
		if (!notMineData.activeSeed) return msg.say(`You water ${personToWater.displayName}'s soil... I guess. :shower:`);

		if (notMineData.activeSeed.watered && notMineData.inventory.includes('DrainagePot')) {
			notMineData.activeSeed.lastEvent = `${msg.member.displayName} overwatered your plant, but luckily you have a drainage pot.`;
			if (Math.floor(Math.random() * 15) == 0) notMineData.inventory.splice(notMineData.inventory.indexOf('DrainagePot'), 1);
			return plants.storePlant(notMine).then(() => msg.say(`Shame on you. You overwatered ${personToWater.displayName}'s plant, but they have a drainage pot. :shower:`));
		}

		if (notMineData.activeSeed.watered) {
			notMineData.progress -= Math.floor(Math.random() * 10) + 7;
			if (notMineData.progress < 0) notMineData.progress = 0;
			notMineData.activeSeed.lastEvent = `${msg.member.displayName} overwatered your plant, undoing some of its effort.`;
			return plants.storePlant(notMine).then(() => msg.say(`You overwatered ${personToWater.displayName}'s plant. That wasn't very nice. :shower:`));
		}
		notMineData.activeSeed.watered = true;
		notMineData.activeSeed.lastEvent = `${msg.member.displayName} watered your plant.`;
		return plants.storePlant(notMine).then(() => msg.say(`${personToWater.displayName}'s plant was watered. :shower:`));
	}
};
