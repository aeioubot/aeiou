const {Command} = require('discord.js-commando');
const permissions = require('../../utils/models/permissions.js');

module.exports = class PacmanCommand extends Command {
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
		if (!await permissions.hasPermission(this.name, msg)) return msg.say(`You don't have permission to use this command.`);
		if (msg.author.id == '147077474222604288' || Math.floor(Math.random() * 15) === 0) {
			return msg.say('<:pacman:415200570261897256> please bep don\'t kill me').then((newMsg) => {
				setTimeout(() => newMsg.edit('<:pacman:415200570261897256>'), 1500);
			});
		}
		return msg.say('<:pacman:415200570261897256>');
	}
};
