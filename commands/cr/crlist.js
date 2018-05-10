const { Command } = require('discord.js-commando');
const reactDB = require('../../utils/models/creact.js');

module.exports = class CrListCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'crlist',
			aliases: [],
			group: 'cr',
			memberName: 'crlist',
			description: 'Show a list of custom reactions in the server.',
			details: 'If the list does not fit into one message, it will be split up in pages of 10 reactions.',
			guildOnly: true,
			args: [
				{
					key: 'argPage',
					prompt: 'Which page?',
					type: 'integer',
					default: 0,
				},
			],
		});
	}

	async run(msg, { argPage }) {
		const reactArray = await reactDB.findAllForGuild(msg.guild.id);
		const triggerArray = reactArray.map((react) => {
			return react.trigger;
		});
		if (triggerArray.length === 0) return msg.say(`There are no custom reaction triggers in **${msg.guild.name}**.`); // No triggers response.
		return msg.say(`The list of custom reaction triggers in **${msg.guild.name}** is: \n\`\`\`${triggerArray.join(', ')}\`\`\``).catch(() => {
			const page = parseInt(argPage) || 1;
			if (page > Math.ceil(triggerArray.length / 10)) return msg.say('That is not a valid page number.');
			const formattedArray = [`Reaction triggers: page ${page} of ${Math.ceil(triggerArray.length / 10)}:\n`];
			for (let i = page * 10 - 9; i < page * 10 + 1; i++) {
				if (triggerArray[i - 1]) formattedArray.push(`${i}. **${triggerArray[i - 1]}**`);
			}
			return msg.say(formattedArray);
		});
	}
};
