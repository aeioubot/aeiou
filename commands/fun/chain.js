const {Command} = require('discord.js-commando');
const chainDB = require('../../utils/models/chain.js');
const {oneLine} = require('common-tags');

module.exports = class ChainCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'chain',
			group: 'fun',
			memberName: 'chain',
			description: 'Starts a chain. use `chain stats` for stats.',
			details: oneLine`Starts a chain. Say the same thing as the guy before you to keep it alive.\n
			No chaining from the same person unless 5 messages have passed since their last.`,
			examples: ['chain meme', 'chain Have you ever heard the tragedy of darth plagueis the wise?'],
			format: '[content]',
			guildOnly: true,
			args: [
				{
					key: 'content',
					prompt: 'What do you want to chain?',
					type: 'string',
					max: 1800,
				},
			],
		});
	}

	async run(msg, {content}) {
		const oldChain = await chainDB.getChain(msg);
		if (new RegExp(`^(${msg.guild.commandPrefix.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}|<@(!)?${this.client.user.id}>)\s*chain`, 'gi').test(content)) {
			return msg.say('Chain nesting is both dangerous and highly illegal.');
		}
		if (content.toLowerCase() == 'stats') {
			const owner = msg.guild.members.get(oldChain.chainOwner);
			if (oldChain.chainLength === 0) return msg.say('There is no longest chain for this server!');
			return msg.say('', {
				embed: {
					title: `Largest chain for ${msg.guild.name}`,
					color: 0xf94d2f,
					author: {
						name: owner ? owner.displayName : `${oldChain.chainOwner} (User left guild)`,
						icon_url: owner ? owner.user.displayAvatarURL : 'https://cdn.drawception.com/images/panels/2017/10-22/RwwgkkS5qQ-10.png',
					},
					fields: [
						{
							name: 'Chain Length',
							value: oldChain.chainLength,
							inline: true,
						},
						{
							name: 'Chain Owner',
							value: owner ? owner.displayName : `${oldChain.chainOwner} (User left guild)`,
							inline: true,
						},
						{
							name: 'Chain Content',
							value: oldChain.chainContent.length > 1024 ? oldChain.chainContent.substring(0, 1020) + '...' : oldChain.chainContent,
						},
					],
				},
			});
		}
		let chainLength = 0;
		const chainContributors = [];
		await msg.say(`Chain started! To continue the chain, say:\n**"${content}"** \n(That includes you, ${msg.member.displayName}.)`);
		let killer;
		const collector = msg.channel.createMessageCollector((m) => m.author.id != this.client.user.id);
		collector.on('collect', (m) => {
			if (m.content === content) {
				if (chainContributors.slice(-5).includes(m.author.id)) {
					killer = m.author.id;
					return collector.stop('chainKillDouble');
				}
				chainLength += 1;
				chainContributors.push(m.author.id);
				return;
			}
			killer = m.author.id;
			return collector.stop('chainKill');
		});
		collector.on('end', (collected, reason) => {
			return msg.say(
				oneLine`Chain ended by ${reason === 'chainKillDouble' ? 'the **double-posting** ': ''}<@${killer}>,
				with a length of **${chainLength}**!
				You ${chainLength > oldChain.chainLength ? '' : 'didn\'t '}beat your old chain record of **${oldChain.chainLength}**!`
			).then(() => {
				if (chainLength > oldChain.chainLength) chainDB.setChain(msg, chainLength, content);
				return;
			});
		});
	}
};
