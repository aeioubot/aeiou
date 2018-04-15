const {Command} = require('discord.js-commando');
const permissions = require('../../utils/models/permissions.js');
const plants = require('../../utils/models/plants.js');

module.exports = class LeavesCommand extends Command {
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
		if (!await permissions.hasPermission(this.name, msg)) return msg.say(`You don't have permission to use this command.`);
		return plants.getPlant(msg).then((plantClass) => {
			return msg.say(`You have **${plantClass.getPlantData().leaves}** leaves. :leaves:`);
		});
	}
};
