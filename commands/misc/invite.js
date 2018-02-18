const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
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
		msg.say('Here\'s a link to invite me to your server.\n<https://discord.now.sh/309024868530257920?p268451902>').catch(() => {});
	}
};
