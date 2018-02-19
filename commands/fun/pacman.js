const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'pacman',
			group: 'fun',
			memberName: 'pacman',
			description: 'pacman',
			details: 'pacman',
			guildOnly: true,
		});
	}

	async run(msg) {
		if (msg.author.id == '147077474222604288') {
			return msg.say('<:pacman:415200570261897256> please bep don\'t kill me').then((newMsg) => {
				setTimeout(() => newMsg.edit('<:pacman:415200570261897256>'), 1500);
			});
		}
		return msg.say('<:pacman:415200570261897256>');
	}
};
