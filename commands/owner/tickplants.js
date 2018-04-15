const {Command} = require('discord.js-commando');
const permissions = require('../../utils/models/permissions.js');
const plants = require('../../utils/models/plants.js');

module.exports = class TickPlantsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'tickplants',
			group: 'owner',
			memberName: 'tickplants',
			description: 'Ticks all plants, globally',
			guildOnly: true,
			args: [
				{
					key: 'times',
					prompt: 'asdasdasd',
					type: 'integer',
					default: '1',
				},
			],
		});
	}

	hasPermission(msg) {
		if (this.client.isOwner(msg.author)) return true;
		return 'cheating will only make your plants hate you.';
	}

	async run(msg, {times}) {
		for (let i = 0; i < times; i++) {
			await plants.testTick();
		}
		msg.react('✅');
	}
};
