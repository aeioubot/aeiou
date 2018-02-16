const {Command} = require('discord.js-commando');
const reactDB = require('../../utils/models/creact.js');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'creact',
			aliases: ['custreact', 'cr'],
			group: 'fun',
			memberName: 'creact',
			description: 'Adds a custom reaction using a trigger and content.',
			details: 'Command for custom reactions. For a given input, the bot will say a given output. Use `add` with content and a trigger, remove and a trigger, or list.\nPut both the trigger and content in quotes.',
			guildOnly: true,
			format: `<add/remove/list> "<trigger>" "<content>"`,
			examples: [`!creact add "bread" "quack"`, `!creact remove "bread"`, `!creact list`],
			args: [
				{
					key: 'option',
					prompt: 'Would you like to add or remove a custom reaction, or list available ones?',
					type: 'string',
					default: '',
				},
				{
					key: 'trigger',
					prompt: 'What is the trigger for the reaction?',
					type: 'string',
					parse: (trigger) => trigger.toLowerCase().trim(),
					default: '', // Default empty arguments for trigger and content, so list doesn't ask for additional arguments.
				},
				{
					key: 'content',
					prompt: 'What should be said in response to the trigger?',
					type: 'string',
					default: '',
				},
			],
		});
	}

	hasPermission(msg) {
		if (this.client.isOwner(msg.author)) return true;
		if (msg.member.hasPermission('MANAGE_MESSAGES')) return true;
		return 'you need permission to manage messages in order to manage custom reacts.';
	}

	async run(msg, {option, trigger, content}) {
		if (option === '') return msg.say('Please select an action.');
		const reactArray = await reactDB.getReacts(msg);
		const testIfCustomReactionExists = reactArray.find((x) => {
			if (x.trigger === trigger) return true;
		});
		switch (option.toLowerCase()) {
		case 'add': {
			if (trigger === '' || content === '') return msg.say('The custom reaction content or trigger can\'t be empty.'); // Because of default arguments, detecting an empty trigger or content when adding is necessary.
			if (testIfCustomReactionExists) return msg.say(`There is already a reaction with the trigger **${trigger}**...`); // return the error
			reactDB.appendToReacts(msg, {
				trigger: trigger,
				content: content,
			});
			return msg.say(`Reaction added, **${trigger}** will cause me to say **${content}**.`);
		}

		case 'remove': // 3 acceptable options to delete using fall-through.
		case 'delete':
		case 'del': {
			if (!testIfCustomReactionExists) return msg.say(`There are no custom reactions with the trigger **${trigger}**...`); // Does not exist.
			reactArray.splice(reactArray.indexOf(testIfCustomReactionExists), 1);
			reactDB.setReacts(msg, reactArray);
			msg.say(`Reaction deleted, I'll no longer respond to **${trigger}**.`);
			break;
		}
		case 'list': { // Lists the triggers in the guild.
			const triggerArray = [];
			reactArray.map((item) => {
				triggerArray.push(item.trigger);
			});
			if (triggerArray.length === 0) return msg.say(`There are no custom reaction triggers in **${msg.guild.name}**.`); // No triggers response.
			return msg.say(`The list of custom reaction triggers in **${msg.guild.name}** are: \n\`\`\`${triggerArray.join(', ')}\`\`\``).catch(() => {
				return msg.say(`The list of custom reaction triggers in **${msg.guild.name}** are too long to show, but here are the first 20.\n\`\`\`${triggerArray.splice(0, 20).join(', ')}\`\`\``).catch(() => {
					return msg.say(`The list of custom reaction triggers in **${msg.guild.name}** are too long to show, and I cannot display them.`);
				});
			});
			break;
		}
		default: msg.say('That isn\'t a valid option.'); break;
		}
	}
};
