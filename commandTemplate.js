const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: '',
			group: '',
			memberName: '',
			description: '',
			details: '',
			examples: ['', ''],
			format: '[]',
			guildOnly: true,
			args: [
				{
					key: '',
					prompt: '',
					type: '',
					default: '',
					format: '[]',
				},
			],
		});
	}

	async run(msg, args) {

	}
};
