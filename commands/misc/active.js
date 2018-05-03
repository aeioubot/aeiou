const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'active',
			group: 'misc',
			memberName: 'active',
			description: 'Shows the members who have been active in the past 5 minutes.',
			details: 'Shows the members who have been active in the past 5 minutes.',
			examples: ['active', 'active 10'],
			format: '[minutes]',
			guildOnly: true,
			args: [
				{
					key: 'minutes',
					prompt: 'kerchoo pop skibi di pap pap',
					type: 'integer',
					default: '5',
				},
			],
		});
	}

	async run(msg, { minutes }) {
		const sayArray = [];
		if (minutes > Math.floor(this.client.uptime / 60000)) minutes = Math.floor(this.client.uptime / 60000);
		if (minutes < 0) minutes = 1;
		const now = Date.now();
		msg.guild.members.forEach((m) => {
			if (m.lastMessage && !m.user.bot && now - m.lastMessage.createdTimestamp <= (minutes * 60000)) sayArray.push(m.user.tag);
		});
		sayArray.unshift(`${sayArray.length} members have been active in the past **${minutes}** minutes:\`\`\``);
		sayArray.push('```');
		sayArray.length < 4 ? msg.say(`1 member has been active in the past **${minutes}** minutes:\n\`\`\`Just you!\`\`\``) : msg.say(sayArray.join('\n'))
			.catch((e) => msg.say(`${sayArray.length} members have been active in the past **${minutes}** minutes:\n\`\`\`Hoo boy that's a lot of members!\`\`\``));
	}
};
