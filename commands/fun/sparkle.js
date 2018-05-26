const {Command} = require('discord.js-commando');

module.exports = class SparkleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'sparkle',
			aliases: ['sparkles'],
			group: 'fun',
			memberName: 'sparkle',
			description: 'Makes your words ✨sparkly✨',
			details: 'Makes your words ✨sparkly✨',
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
		msg.say(`:sparkles:_~ ${echo} ~_:sparkles:`).catch(() => {
			msg.say(`:sparkles:_~ ${echo.slice(0, 1900)} ~_:sparkles:`);
			msg.delete();
		}).catch(() => {});
	}
};
