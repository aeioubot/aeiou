const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');

module.exports = class TossCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'toss',
			group: 'plant',
			memberName: 'toss',
			aliases: ['discard'],
			description: 'Discards the selected seed.',
			details: 'Discards the selected seed.',
			examples: ['toss 1', 'toss 4'],
			format: '[seed number]',
			guildOnly: true,
			args: [
				{
					key: 'seedNumber',
					label: 'seed number',
					prompt: 'Which seed would you like to throw away?',
					type: 'integer',
				},
			],
		});
	}

	async run(msg, {seedNumber}) {
		plants.getPlant(msg).then((plant) => {
			if (plant.removeFromSeeds(seedNumber).success) {
				plants.storePlant(plant);
				return msg.say('That seed was thrown away. :wastebasket:');
			}
			return msg.say('That\'s not a valid seed.');
		});
	}
};
