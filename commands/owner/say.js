const {Command} = require('discord.js-commando');

module.exports = class SayCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'say',
			group: 'owner',
			memberName: 'say',
			description: 'Echos the argument.',
			details: 'Echos the argument.',
			args: [
				{
					key: 'echo',
					prompt: 'What would you like me to say?',
					type: 'string',
				},
			],
		});
	}
	hasPermission(msg) {
		if (!this.client.isOwner(msg.author) || !msg.member.hasPermission('ADMINISTRATOR')) return 'only owners and admins can do that.';
		return true;
	}

	async run(msg, {echo}) {
		msg.say(echo);
		return msg.delete().catch(() => msg.react('👀'));
	}
};
