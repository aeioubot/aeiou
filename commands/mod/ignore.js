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
			permissions.defaultPermission(msg, {
				targetType: 'channel',
				target: msg.channel.id,
				command: '*',
			}).then(() => {
				msg.say('I\'m L I S T E N')
			});
		} else {
			permissions.setPermission(msg, {
				targetType: 'channel',
				target: msg.channel.id,
				command: '*',
				allow: false,
			}).then(() => {
				msg.say('I\'m IGNORING!!!!!')
			});
		}
		return;
		const provider = this.client.provider;
		const ignoredChannels = provider.get(msg.guild.id, 'ignoredChannels', []);
		if (ignoredChannels.includes(msg.channel.id)) {
			ignoredChannels.splice(ignoredChannels.indexOf(msg.channel.id), 1);
			return provider.set(msg.guild.id, 'ignoredChannels', ignoredChannels).then(() => {
				msg.say('I\'m now listening to this channel.').then((msg) => msg.delete(3000));
			});
		}
		if (!ignoredChannels.includes(msg.channel.id)) {
			msg.guild.members.map(m => {
				if (m.currentSearch) m.currentSearch.stop();
				delete m.currentSearch;
			});
			ignoredChannels.push(msg.channel.id);
			return provider.set(msg.guild.id, 'ignoredChannels', ignoredChannels).then(() => {
				msg.say('I\'m no longer listening to this channel.').then((msg) => msg.delete(3000));
			});
		}
	}
};
