const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'plant',
			group: 'plant',
			memberName: 'plant',
			description: 'Plants a seed.',
			details: 'Plants a seed, causing it to grow over time.',
			examples: ['plant 3', 'plant 9'],
			format: '[seed]',
			guildOnly: true,
			args: [
				{
					key: 'seedNumber',
					prompt: 'Which seed would you like to plant?',
					type: 'integer',
				},
			],
		});
	}

	async run(msg, {seedNumber}) {
		const userPlant = await plants.getPlant(msg);
		if (userPlant.getPlantData().activeSeed) return msg.say("You already have a seed planted, if you wish to harvest or destroy it early, use `!harvest`.");
		const planted = await userPlant.plant(seedNumber);
		if (!planted.success) return msg.say("That isn't a valid seed number! Use `!seeds` to see the seeds you own.");
		return plants.storePlant(userPlant)
			.then(() => msg.say("Your seed has been planted. Be sure to water it."));
	}
};
