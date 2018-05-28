const {Command} = require('discord.js-commando');
const reactDB = require('../../utils/models/creact.js');
const {stripIndents} = require('common-tags');

module.exports = class CReactCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'creact',
			aliases: ['custreact', 'cr'],
			group: 'cr',
			memberName: 'creact',
			description: 'Adds a custom reaction using a trigger and content.',
			details: stripIndents`Command for custom reactions. For a given input, the bot will say a given output.
			**OPTIONS:**
			\`add\`: Adds a new trigger and content. **Add multiple contents to a trigger and a random one will be picked every time**.
			\`del\`: Deletes a content by a given index on a trigger. See the \`crlist\` command for more help.
			\`list\`: See the \`crlist\` command.
			
			Put both the trigger and content in quotes.
			
			**PARTIAL:**
			Include \`--partial\` in the trigger to make it match anywhere in the message.
			For example, "aeiou --partial" will match "aeiou is cool".
				
			**TEMPLATES:**
			You can use templates in both the trigger and the content, and they will correspond from the trigger to the content.
			For example, with a trigger of "{1} is cool" and a content of "yes {1} is cool",
			"zaop is cool" will make Aeiou respond "yes zaop is cool".

			\`--partial\` works here as well.

			You can use numbers 1-9 between curly braces.`,
			guildOnly: true,
			format: `<option> "<trigger>" "<content>"`,
			examples: [`!creact add "bread" "quack"`, `!creact remove "bread"`, `!creact list`],
			args: [
				{
					key: 'option',
					prompt: 'Would you like to `add`, `remove`, or `list` a custom reaction?',
					type: 'string',
					validate: (s) => {
						if (!s) return false;
						return ['add', 'remove', 'list', 'del', 'delete'].includes(s.toLowerCase());
					},
					parse: (s) => s.toLowerCase(),
				},
				{
					key: 'trigger',
					prompt: 'What is the trigger for the reaction?',
					type: 'string',
					parse: (trigger) => trigger.toLowerCase().replace(/`|\*|_|~/gi, '').trim(),
					validate: (value, msg, currArg, prevArgs) => {
						if (prevArgs.option === 'list') return true;
						return value && value.length >= 1;
					},
				},
				{
					key: 'content',
					prompt: 'What should be said in response to the trigger?',
					type: 'string',
					validate: (value, msg, currArg, prevArgs) => {
						if (['list', 'remove', 'del', 'delete'].includes(prevArgs.option)) return true;
						if (prevArgs.option === 'add' && !value) return false;
						return value && value.length >= 1;
					},
				},
			],
		});
	}

	hasPermission(msg) {
		return msg.member.hasPermission('MANAGE_MESSAGES') || this.client.isOwner(msg.author.id);
	}

	async run(msg, { option, trigger, content, specificReaction }) {
		switch (option.toLowerCase()) {
			case 'add': {
				return reactDB.addReaction(msg, trigger, content).then(() => {
					return msg.say(`Reaction added! I will now say **${content}** in response to **${trigger}**.`);
				});
			}
			case 'remove': // 3 acceptable options to delete using fall-through.
			case 'delete':
			case 'del': {
				if (content === 'all') {
					return reactDB.deleteTrigger(msg, trigger.replace('--partial', '').trim()).then(() => {
						return msg.say(`Deleted ALL reactions for the trigger **${trigger}**`);
					});
				}
				return reactDB.deleteReaction(msg, trigger.replace('--partial', '').trim(), parseInt(content)-1).then((bool) => {
					if (!bool) return msg.say('There is no reaction with that trigger, or you chose an invalid index.\nYou may also use `all` for the index to delete all reactions for this trigger.');
					return msg.say(`Reaction deleted, I'll no longer respond _that_ in response to **${trigger}**.`);
				}).catch(() => {
					return msg.say(`You must include an index of the reaction to delete. See \`${msg.guild.commandPrefix}crlist\` for more info.\nAlternatively, use \`${msg.guild.commandPrefix} cr del "${trigger}" all\` to delete all responses for this trigger.`);
				});
			}
			case 'list': { // Lists the triggers in the guild.
				return this.client.registry.commands.get('crlist').run(msg, {argPage: trigger, specificReaction: content});
			}
			default: msg.say('That isn\'t a valid option.'); break;
		}
	}
};
