const commando = require('discord.js-commando');
const permissions = require('../../utils/models/permissions.js');

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
		if (!await permissions.hasPermission(this.name, msg)) return msg.say(`You don't have permission to use this command.`);
		try {
			const placeholder = await msg.say('Pinging...');
			return placeholder.edit(`Pong! Aeiou's ping is \`${placeholder.createdTimestamp - msg.createdTimestamp}ms\`. ${this.client.ping ? `The websocket ping is \`${Math.round(this.client.ping)}ms.\`` : ''}`);
		} catch (ex) {
			//
		}
	}
};
