const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'dig',
			group: 'plant',
			memberName: 'dig',
			description: 'Digs at the floor, netting you a poor quality seed.',
			details: 'Digs at the floor, netting you a poor quality seed.',
			examples: ['dig'],
			guildOnly: false,
			throttling: {usages: 1, duration: 43200},
		});
	}

	async run(msg, args) {
		return plants.getPlant(msg).then(plantClass => {
			plantClass.addToSeeds({
				growthRate: 8,
				leafiness: 10,
				sleepChance: 60,
				waterAffinity: 10,
			}).then(() => {
				plants.storePlant(plantClass);
				msg.say("You scratch at the floor, finding an extremely poor quality seed. :seedling:");
			}).catch(() => {
				msg.say("Your seed pouch is full, you cannot hold any more seeds.");
			});
		});
	}
};
