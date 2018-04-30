const { Command } = require('discord.js-commando');
const permissions = require('../../utils/models/permissions.js');

module.exports = class IgnoreCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ignore',
			group: 'mod',
			memberName: 'ignore',
			description: 'Toggles whether Aeiou will run commands in this channel.',
			details: 'Toggles whether Aeiou will run commands in this channel.',
			guildOnly: true,
		});
	}

	hasPermission(msg) {
		if (msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author.id)) return true;
		return 'You need to be an adminstrator for this.';
	}

	async run(msg) {
		const x = await permissions.findPermissions({
			targetType: 'channel',
			target: msg.channel.id,
			command: '*',
			guild: msg.guild.id,
		});
		if (x) {
			return permissions.defaultPermission(msg, {
				targetType: 'channel',
				target: msg.channel.id,
				command: '*',
			}).then(() => {
				return msg.say('I\'m now listening to this channel.');
			});
		}
		return permissions.setPermission(msg, {
			targetType: 'channel',
			target: msg.channel.id,
			command: '*',
			allow: false,
		}).then(() => {
			return msg.say('I\'m now ignoring this channel. Type `!ignore` again to undo.');
		});
	}
};
