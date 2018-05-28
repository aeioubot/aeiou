const {Command} = require('discord.js-commando');
const reactDB = require('../../utils/models/creact.js');

module.exports = class CReactCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'creact',
			aliases: ['custreact', 'cr'],
			group: 'cr',
			memberName: 'creact',
			description: 'Adds a custom reaction using a trigger and content.',
			details: 'Command for custom reactions. For a given input, the bot will say a given output. Use `add` with content and a trigger, remove and a trigger, edit with content and a trigger, or list.\nPut both the trigger and content in quotes.',
			guildOnly: true,
			format: `<add/remove/edit/list> "<trigger>" "<content>"`,
			examples: [`!creact add "bread" "quack"`, `!creact edit "bread" "duck"`, `!creact remove "bread"`, `!creact list`],
			args: [
				{
					key: 'option',
					prompt: 'Would you like to `add`, `remove`, `edit`, or `list` a custom reaction?',
					type: 'string',
					validate: (s) => {
						if (!s) return false;
						return ['add', 'remove', 'list', 'del', 'delete', 'edit'].includes(s.toLowerCase());
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
				});
			}
			case 'list': { // Lists the triggers in the guild.
				return this.client.registry.commands.get('crlist').run(msg, {argPage: trigger, specificReaction: content});
			}
			default: msg.say('That isn\'t a valid option.'); break;
		}
	}
};
