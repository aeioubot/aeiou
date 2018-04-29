const { Command } = require('discord.js-commando');

module.exports = class PtestCommand extends Command {
	constructor(client) {
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
		msg.say('Hello! This command is running :-)');
	}
};
