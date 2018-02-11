const {Command} = require('discord.js-commando');
const donorDB = require('../../utils/models/donor.js');

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
		const donors = await donorDB.getDonors(msg);
		if (donors.length < 1) return msg.say('This server has no donor colors.');
		let message = 'Here are the current donors, and the colors they are assigned to:\n```';
		donors.forEach(donor => {
			message += `${msg.guild.members.find('id', donor.id).user.username.padEnd(35)}${msg.guild.roles.find('id', donor.role).name}\n`;
		});
		message += '```';
		msg.say(message);
	}
};
