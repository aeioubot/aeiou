const {Command} = require('discord.js-commando');
const Gcmd = require('../../utils/classes/GatewayCommand');
const {stripIndents, oneLine} = require('common-tags');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'bepfinder',
			aliases: ['bepfriends', 'bepfriend', 'beps'],
			group: 'fun',
			memberName: 'bepfinder',
			description: 'Finds all your bepfriends, people that have the same discriminator as you.',
			details: oneLine`Before Discord Nitro allowed you to change your discrim (the numbers after your username) at will, the only way to do so was to have
			a username that matched someone elses, who had the same discrim. Bepfinder was used to find such people, and reroll your discrim. To do so,
			simply change your username to match any of your Bepfriends, and your discrim will change to a random number. Since Discord Nitro makes this obselete,
			it's only useful for those without Nitro subscriptions.`,
			examples: ['bepfinder', 'bepfinder 0111'],
			format: '[discriminator]',
			guildOnly: true,
			args: [
				{
					key: 'discrim',
					prompt: 'kachow my car boy',
					type: 'string',
					default: '',
				},
			],
		});
	}

	async run(msg, {discrim}) {
		discrim = discrim.replace(/[^0-9]/g, '');
		if (discrim && (discrim.length !== 4 | !parseInt(discrim))) return msg.say('The discrim must be a 4-character number between 0000 and 9999.');
		return this.client.gateway.sendMessage(new Gcmd(
			this.client.shard.count,
			this.client.shard.id,
			'bepFinder',
			[],
			{
				discrim: discrim ? discrim : msg.author.discriminator,
			}
		)).then((subArrays) => {
			let userTags = [];
			for (const array of subArrays) userTags = userTags.concat(array);
			userTags = Array.from(new Set(userTags.filter(d => d !== null))); // Filter all nulls (dead shards), turn to Set (remove all dupes), turn back into array (to join).
			if (!discrim && userTags.length === 1) userTags[0] = 'Looks like you have none...';
			return msg.say(
				stripIndents`${discrim ? `Here are the bepfriends for **#${discrim}**!` : `Here are your bepfriends!`}\`\`\`${userTags.join('\n')}\`\`\`
				ℹ What's this? Type \`${msg.guild.commandPrefix}help bepfinder\` for details.`
			).catch(() => {
				return msg.say(`It looks like you have a LOT of friends! I can't show you all ${userTags.length} of them, but here are 20.\`\`\`${userTags.splice(0, 20).join('\n')}\`\`\``);
			});
		});
	}
};
