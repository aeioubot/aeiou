const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ping',
			group: 'core',
			memberName: 'ping',
			description: 'do a ping',
			details: 'use it to see if aeiou is online',
			examples: ['!ping'],
			format: '',
			guildOnly: false
		});
	}

	async run(msg, args) {
		msg.say("Pong!");
	}
};
