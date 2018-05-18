const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'toggleseeds',
			group: 'config',
			memberName: 'toggleseeds',
			description: 'Toggles whether seeds will be planted in this channel.',
			details: 'Toggles whether seeds will be planted in this channel.',
			examples: ['toggleseeds'],
			guildOnly: true,
		});
	}

	async run(msg) {
		const provider = this.client.provider;
		const ignoredChannels = provider.get(msg.guild.id, 'noSeedChannels', []);
		if (ignoredChannels.includes(msg.channel.id)) {
			ignoredChannels.splice(ignoredChannels.indexOf(msg.channel.id), 1);
			return provider.set(msg.guild.id, 'noSeedChannels', ignoredChannels).then(() => {
				msg.say('I\'m now planting seeds in this channel.').then((msg) => msg.delete(3000));
			});
		}
		if (!ignoredChannels.includes(msg.channel.id)) {
			ignoredChannels.push(msg.channel.id);
			return provider.set(msg.guild.id, 'noSeedChannels', ignoredChannels).then(() => {
				msg.say('I\'m no longer planting seeds in this channel.').then((msg) => msg.delete(3000));
			});
		}
	}
};
