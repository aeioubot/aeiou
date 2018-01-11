const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ping',
			group: 'fun',
			memberName: 'ping',
			description: 'do a ping',
			details: 'use it to see if aeiou is online',
			examples: ['!ping'],
			format: '',
			guildOnly: true,
		});
	}

	async run(msg, args) {
		msg.say(`hi ${msg.member.nickname ? msg.member.nickname : msg.member.user.username}`);
	}
};
