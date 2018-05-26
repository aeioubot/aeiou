const {Command} = require('discord.js-commando');
const starboard = require('../../utils/models/starboard.js');

module.exports = class LimitCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'limit',
			group: 'starboard',
			memberName: 'limit',
			aliases: ['threshold'],
			description: 'S T A R B O A R D L I M I T',
			details: 'S T A R B O A R D L I M I T',
			examples: ['limit 3'],
			guildOnly: true,
			args: [
				{
					key: 'limit',
					prompt: 'which limit!',
					type: 'integer',
				},
			],
		});
	}

	async run(msg, args) {
		starboard.setLimit(msg, args.limit);
		msg.say('ok');
	}
};
