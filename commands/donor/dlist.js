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

	async run(msg) {
		const donors = this.client.provider.get(msg.guild.id, 'donorColors', []);
		if (donors.length < 1) return msg.say('This server has no donor colors.');
		let message = 'Here are the current donors, and the colors they are assigned to:\n```';
		donors.forEach(donor => {
			message += `${msg.guild.members.find('id', donor.id).user.username}        ${msg.guild.roles.find('id', donor.role).name}\n`;
		});
		message += '```';
		msg.say(message);
	}
};
