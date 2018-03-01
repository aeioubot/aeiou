const { Command } = require('discord.js-commando');

module.exports = class WizardCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'wizard',
			group: 'fun',
			memberName: 'wizard',
			description: 'A wizard says your words using his special wizard powers.',
			details: 'A wizard says your words using his special wizard powers.',
			args: [
				{
					key: 'echo',
					prompt: 'What would you like the wizard to say?',
					type: 'string',
				},
			],
		});
	}

	async run(msg, { echo }) {
		msg.say(`__\\_/\\\\\\___
(°͜-°)   :sparkles: *${echo}*
 /|\\\\／
  /\\`).catch(() => {
			msg.say(`__\\_/\\\\\\___
(°͜-°)   :sparkles: *${echo}*
 /|\\\\／
  /\\`);
		}).catch(() => {});
	}
};
