const { Command } = require('discord.js-commando');
const permissions = require('../../utils/models/permissions.js');

module.exports = class PtestCommand extends Command {
	constructor (client) {
		super(client, {
			name: 'ptest',
			aliases: ['pt'],
			group: 'permissions',
			memberName: 'ptest',
			description: 'test.',
			details: 'testtest',
			examples: ['ptest'],
			format: '[]',
		});
	}

	async run(msg, args) {
		if (!await permissions.hasPermission(this.name, msg)) return msg.say(`You don't have permission to use this.`);
		msg.say('Hello! This command is running :-)');
	}
};
