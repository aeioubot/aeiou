const {Command} = require('discord.js-commando');
const starboard = require('../../utils/models/starboard.js');

module.exports = class ChannelCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'channel',
			group: 'starboard',
			memberName: 'channel',
			aliases: ['channel'],
			description: 'S T A R B O A R D ccccccc',
			details: 'S T A R B O A R D ccccccccccc',
			examples: ['channel 3'],
			guildOnly: true,
			args: [
				{
					key: 'channel',
					prompt: 'which channel!',
					type: 'channel',
				},
			],
		});
	}

	async run(msg, args) {
		msg.say('oke');
		starboard.setChannel(msg, args.channel);
	}
};
