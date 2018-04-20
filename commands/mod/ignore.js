const {Command} = require('discord.js-commando');
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
		if (!await permissions.hasPermission(this.name, msg)) return msg.say(`You don't have permission to use this command.`);
		const provider = this.client.provider;
		const ignoredChannels = provider.get(msg.guild.id, 'ignoredChannels', []);
		if (ignoredChannels.includes(msg.channel.id)) {
			ignoredChannels.splice(ignoredChannels.indexOf(msg.channel.id), 1);
			return provider.set(msg.guild.id, 'ignoredChannels', ignoredChannels).then(() => {
				msg.say('I\'m now listening to this channel.').then((msg) => msg.delete(3000));
			});
		}
		if (!ignoredChannels.includes(msg.channel.id)) {
			ignoredChannels.push(msg.channel.id);
			return provider.set(msg.guild.id, 'ignoredChannels', ignoredChannels).then(() => {
				msg.say('I\'m no longer listening to this channel.').then((msg) => msg.delete(3000));
			});
		}
	}
};
