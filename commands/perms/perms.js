const { Command } = require('discord.js-commando');

module.exports = class PermissionCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'permission',
			group: 'permissions',
			memberName: 'permission',
			description: 'Allow or deny command permissions to a channel or role.',
			details: 'read the description lmao',
			examples: [''],
			format: '[]',
			guildOnly: true,
			args: [
				{
					key: 'action',
					prompt: 'Muh nuh nuh nuh nuh',
					type: 'string',
					default: '',
				},
			],
		});
	}

	async run(msg, args) {

	}
};
