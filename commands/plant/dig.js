const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');

module.exports = class DigCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'dig',
			group: 'plant',
			memberName: 'dig',
			description: 'Digs at the floor, netting you a poor quality seed.',
			details: 'Digs at the floor, netting you a poor quality seed. Has a cooldown of 12 hours.',
			examples: ['dig'],
			guildOnly: true,
			throttling: {usages: 1, duration: 7200},
		});
	}

	async run(msg, args) {
		return plants.getPlant(msg).then((plantClass) => {
			const color = Math.floor(Math.random() * 3);
			const added = plantClass.addToSeeds({
				name: 'An unnamed seed',
				growthRate: 8,
				leafiness: 10,
				waterAffinity: 10,
				red: color === 0 ? 255 : 0,
				green: color === 1 ? 255 : 0,
				blue: color === 2 ? 255 : 0,
			});
			return plants.storePlant(plantClass)
				.then(() => msg.say(added.success ?
					'You scratch at the floor, finding an extremely poor quality seed. :seedling:' :
					'Your seed pouch is full, you cannot hold any more seeds. <:seedPouch:411660762470416399>'));
		});
	}
};
