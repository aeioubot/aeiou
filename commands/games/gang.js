const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'gang',
			group: 'games',
			memberName: 'gang',
			description: 'This is the command for all gang subcommands, type "help gang" for all gang commands"',
			details: '',
			examples: ['', ''],
			format: '[subcommand] [arguments]',
			guildOnly: true,
			args: [
				{
					key: 'subcommand',
					prompt: 'this is a prompt haha lmao',
					type: 'string',
					default: '',
				},
			],
		});
	}

	async run(msg, args) {
		//
	}
};
