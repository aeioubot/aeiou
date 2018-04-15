const {Command} = require('discord.js-commando');
const permissions = require('../../utils/models/permissions.js');

module.exports = class SupportCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'support',
			group: 'misc',
			memberName: 'support',
			description: 'DMs you a link to the support server.',
			details: 'DMs you a link to the support server.',
		});
	}

	async run(msg) {
		if (!await permissions.hasPermission(this.name, msg)) return msg.say(`You don't have permission to use this command.`);
		const test = await msg.say('I\'m DMing an invite to you!');
		return msg.author.send('Here\'s an invite to the support server: \n https://discord.gg/JB8xdT5')
			.then(() => {
				setTimeout(() => test.delete(), 2000);
			})
			.catch(() => {
				test.edit('I wasn\'t able to DM you...');
			});
	}
};
