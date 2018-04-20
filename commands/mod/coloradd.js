const {Command} = require('discord.js-commando');
const permissions = require('../../utils/models/permissions.js');

module.exports = class ColorAddCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'coloradd',
			group: 'mod',
			memberName: 'coloradd',
			description: 'Adds a color or multiple color objects to the color list.',
			details: 'Adds a color role to the list of colors for this server. Users can assign themselves colors that are on the list.',
			examples: ['!color red', '!color red green blue teal periwinkle orangered'],
			format: '[role or roles]',
			guildOnly: true,
			args: [
				{
					key: 'roles',
					infinite: true,
					prompt: 'Which roles would you like to add to the list?',
					type: 'role',
					format: '[role or roles]',
				},
			],
		});
	}

	hasPermission(msg) {
		if (this.client.isOwner(msg.author)) return true;
		if (msg.member.hasPermission('MANAGE_ROLES')) return true;
		return 'you need permission to manage roles in order to manage colors.';
	}

	async run(msg, { roles }) {
		if (!await permissions.hasPermission(this.name, msg)) return msg.say(`You don't have permission to use this command.`);
		//
	}
};
