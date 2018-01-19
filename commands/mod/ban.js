const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ban',
			group: 'mod',
			memberName: 'ban',
			description: 'Bans the selected user instantly.',
			details: 'Bans the selected user instantly.',
			examples: ['!ban [annoying person]', '!ban [raider dude]'],
			format: '[user]',
			guildOnly: true,
			args: [
				{
					key: 'user',
					prompt: 'Which user would you like to ban?',
					type: 'member',
					format: '[user]',
				},
			],
		});
	}

	async run(msg, { user }) {
		user.ban().then(() => {
			msg.say(`**${user.displayName}** has been banned.`);
		}).catch(() => {
			msg.say('There was a problem banning that user. Please make sure I have the correct permissions.');
		});
	}
};
