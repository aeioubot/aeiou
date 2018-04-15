const {Command} = require('discord.js-commando');
const permissions = require('../../utils/models/permissions.js');

module.exports = class SparkleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'sparkle',
			aliases: ['sparkles'],
			group: 'fun',
			memberName: 'sparkle',
			description: 'Makes your words :sparkles:_*sparkly*_:sparkles:',
			details: 'Makes your words :sparkles:_*sparkly*_:sparkles:',
			args: [
				{
					key: 'echo',
					prompt: 'What would you like me to say?',
					type: 'string',
				},
			],
		});
	}

	async run(msg, { echo }) {
		if (!await permissions.hasPermission(this.name, msg)) return msg.say(`You don't have permission to use this command.`);
		msg.say(`:sparkles:_~ ${echo} ~_:sparkles:`).catch(() => {
			msg.say(`:sparkles:_~ ${echo.slice(0, 1900)} ~_:sparkles:`);
		}).catch(() => {});
	}
};
