const {Command} = require('discord.js-commando');

module.exports = class SayCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'sparkle',
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

	async run(msg, {echo}) {
		msg.say(`:sparkles:_*${echo}*_:sparkles:`).catch(() => {});
	}
};
