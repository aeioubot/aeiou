const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'niek',
			group: 'owner',
			memberName: 'niek',
			description: 'Changes my nickname on this server.',
			details: 'Changes my nickname on this server.',
			args: [
				{
					key: 'niek',
					prompt: 'What would you like me to be nicknamed??',
					type: 'string',
				},
			],
		});
	}
	hasPermission(msg) {
		if (!this.client.isOwner(msg.author)) return "only owners can do that.";
		return true;
	}

	async run(msg, {niek}) {
		if (niek.length > 32) return msg.say("That nickname was too long");
		msg.guild.me.setNickname(niek).then(() => {
			msg.say(`hi its me ${niek}`);
		});
	}
};
