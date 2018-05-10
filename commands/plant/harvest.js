const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');

module.exports = class HarvestCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'harvest',
			group: 'plant',
			memberName: 'harvest',
			description: 'Harvests your plant, making space for a new one.',
			details: 'Harvests your plant, granting you leaves if it is fully grown, killing it if it is not. You do not get the seed back.',
			examples: ['harvest'],
			guildOnly: true,
		});
	}

	async run(msg) {
		const userPlant = await plants.getPlant(msg);
		const harvest = await userPlant.harvest();
		plants.storePlant(userPlant);
		if (!harvest.success) return msg.say('You couldn\'t harvest your plant. Maybe you don\'t have one planted, maybe your seed pouch is full.');
		const result = harvest.grown ? `Your plant was successfully harvested for a total of **${harvest.leaves}** leaves, and a seed was added back to your pouch. :blossom:` : 'Your poor plant. You killed it before it was finished growing. :skull:';
		return msg.say(result);
	}
};
