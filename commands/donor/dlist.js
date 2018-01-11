const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'dlist',
			group: 'donor',
			memberName: 'dlist',
			description: 'Lists the current donators and the roles they are assigned to.',
			details: 'Lists the current donators and the roles they are assigned to.',
			examples: ['dlist'],
			guildOnly: true,
		});
	}

	async run(msg, args) {
		const allDonors = this.client.provider.get(msg.guild.id, 'donorColors', []);
		if (allDonors.length < 1) return msg.say('This server has no donor colors.');
		let toSend = 'Here are the current donors, and the colors they are assigned to:\n```';
		allDonors.forEach((element) => {
			toSend += `${msg.guild.members.find('id', element.user).user.username}        ${msg.guild.roles.find('id', element.role).name}\n`;
		});
		toSend += '```';
		msg.say(toSend);
	}
};
