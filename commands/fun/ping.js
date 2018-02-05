const commando = require('discord.js-commando');

module.exports = class PingCommand extends commando.Command {
	constructor(client) {
		super(client, {
			name: 'ping',
			group: 'fun',
			memberName: 'ping',
			description: 'Checks the bot\'s ping to the Discord server.',
			throttling: {
				usages: 5,
				duration: 10,
			},
		});
	}

	async run(msg) {
		try {
			const placeholder = await msg.say('Pinging...');
			return placeholder.edit(`Pong! Aeiou's ping is \`${placeholder.createdTimestamp - msg.createdTimestamp}ms\`. ${this.client.ping ? `The websocket ping is \`${Math.round(this.client.ping)}ms.\`` : ''}`);
		} catch (ex) {
			//
		}
	}
};
