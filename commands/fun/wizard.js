const { Command } = require('discord.js-commando');
const permissions = require('../../utils/models/permissions.js');
const { stripIndent } = require('common-tags');

module.exports = class WizardCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'wizard',
			aliases: ['wiz', 'lizardwizard', 'lizwiz'],
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
		if (!await permissions.hasPermission(this.name, msg)) return msg.say(`You don't have permission to use this command.`);
		if (echo.length > 24) {
			return msg.say(`The wizard inhales–\n*:sparkles: "${echo}" :sparkles:*
                            __\\_/\\\\\\___
                            (°͜-°)   :sparkles:
                            /|\\\\／
                            /\\
            
            `);
		}
		return msg.say(stripIndent`
                  __\\_/\\\\\\___
                  (°͜-°):sparkles: *${echo}*
                  /|\\\\／
                  /\\`).catch(() => msg.say('The wizard deems that phrase unworthy.'));
	}
};
