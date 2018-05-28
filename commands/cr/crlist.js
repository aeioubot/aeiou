const { Command } = require('discord.js-commando');
const reactDB = require('../../utils/models/creact.js');

module.exports = class CrListCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'crlist',
			aliases: [],
			group: 'cr',
			memberName: 'crlist',
			description: 'Show a list of custom reactions in the server, and manage them in-depth.',
			guildOnly: true,
			args: [
				{
					key: 'argPage',
					prompt: 'Which page?',
					type: 'integer',
					default: 0,
				},
				{
					key: 'specificReaction',
					prompt: 's',
					type: 'integer',
					default: 0,
				},
			],
		});
	}

	async run(msg, { argPage, specificReaction }) {
		const page = parseInt(argPage) || 1;
		const reactsArray = reactDB.getReacts(msg.guild.id);
		if (reactsArray.length === 0) return msg.say('There are no custom reactions for this server.');
		if (specificReaction > 0) {
			const formattedArray = [`Contents for the trigger **${reactsArray[specificReaction - 1].trigger}**: page ${page} of ${Math.ceil(reactsArray.length / 10)}:\n\`\`\``];
			let cont = 1;
			for (const r of reactsArray[specificReaction - 1].contents) {
				formattedArray.push(`${cont}. ${r}`);
				cont += 1;
			}
			formattedArray.push(`\`\`\`Use \`${msg.guild.commandPrefix} cr del "${reactsArray[specificReaction - 1].trigger}" <index>\` to delete one of these responses. Use \`all\` for index to delete ALL of these.`);
			return msg.say(formattedArray.join('\n'));
		}
		if (page > Math.ceil(reactsArray.length / 10) || page <= 0) return msg.say('That is not a valid page number.');
		const formattedArray = [`Reaction triggers: page ${page} of ${Math.ceil(reactsArray.length / 10)}:\`\`\``];
		for (let i = page * 10 - 9; i < page * 10 + 1; i++) {
			if (reactsArray[i - 1]) formattedArray.push(`${i}. ${reactsArray[i - 1].trigger.padEnd(40, ' ')} ~ ${reactsArray[i - 1].contents.length === 1 ? '' : `${reactsArray[i - 1].contents.length} reactions, `}type: ${reactsArray[i - 1].type}`);
		}
		formattedArray.push(`\`\`\`\n Use \`${msg.guild.commandPrefix} crlist ${argPage} <index>\` to see all the reactions for a trigger.`);
		return msg.say(formattedArray);
	}
};
