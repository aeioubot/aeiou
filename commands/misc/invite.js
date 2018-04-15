const {Command} = require('discord.js-commando');
const permissions = require('../../utils/models/permissions.js');

module.exports = class InviteCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'invite',
			group: 'misc',
			memberName: 'invite',
			description: 'Gives an invite link to add Aeiou to your server.',
			details: 'Gives an invite link to add Aeiou to your server.',
			examples: ['1invite'],
			guildOnly: false,
		});
	}

	async run(msg) {
		if (!await permissions.hasPermission(this.name, msg)) return msg.say(`You don't have permission to use this command.`);
		msg.say('Here\'s a link to invite me to your server.\n<https://discord.now.sh/309024868530257920?p268451902>').catch(() => {});
	}
};
