const {Command} = require('discord.js-commando');

module.exports = class SupportyCommand extends Command {
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
