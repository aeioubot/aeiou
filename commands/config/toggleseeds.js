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
			args: [
				{
					key: 'all',
					prompt: 'kachow bada boom yolo xd',
					type: 'string',
					default: '',
				},
			],
		});
	}

	async run(msg, { all }) {
		const provider = this.client.provider;
		const ignoredChannels = provider.get(msg.guild.id, 'noSeedChannels', []);

		if (all.toLowerCase() === 'all') {
			if (ignoredChannels.includes(msg.channel.id)) {
				return provider.set(msg.guild.id, 'noSeedChannels', []).then(() => {
					msg.say('I\'m now planting seeds in ALL channels in this guild.').then((msg) => msg.delete(3000));
				});
			}
			if (!ignoredChannels.includes(msg.channel.id)) {
				return provider.set(msg.guild.id, 'noSeedChannels', Array.from(msg.guild.channels.filter(g => g.type === 'text').keys())).then(() => {
					msg.say('I\'m no longer planting seeds in ANY channels in this guild.').then((msg) => msg.delete(3000));
				});
			}
		}

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
