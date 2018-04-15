const {Command} = require('discord.js-commando');
const permissions = require('../../utils/models/permissions.js');

module.exports = class NickCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'nick',
			aliases: ['niek'],
			group: 'owner',
			memberName: 'nick',
			description: 'Changes my nickname on this server.',
			details: 'Changes my nickname on this server.',
			guildOnly: true,
			args: [
				{
					key: 'nick',
					prompt: 'What would you like me to be nicknamed?',
					type: 'string',
				},
			],
		});
	}

	hasPermission(msg) {
		if (this.client.isOwner(msg.author) || msg.member.hasPermission('MANAGE_NICKNAMES')) return true;
		return 'only owners can do that.';
	}

	async run(msg, {nick}) {
		if (nick.length > 32) return msg.say('That nickname was too long.');
		return msg.guild.me.setNickname(nick).then(() => {
			msg.say(`hi its me ${nick}`);
			return msg.delete().catch(() => {});
		});
	}
};
