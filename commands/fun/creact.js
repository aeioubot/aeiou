const {Command} = require('discord.js-commando');
const reactDB = require('../../utils/models/creact.js');

module.exports = class CReactCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'creact',
			aliases: ['custreact', 'cr'],
			group: 'fun',
			memberName: 'creact',
			description: 'Adds a custom reaction using a trigger and content.',
			details: 'Command for custom reactions. For a given input, the bot will say a given output. Use `add` with content and a trigger, remove and a trigger, edit with content and a trigger, or list.\nPut both the trigger and content in quotes.',
			guildOnly: true,
			format: `<add/remove/edit/list> "<trigger>" "<content>"`,
			examples: [`!creact add "bread" "quack"`, `!creact edit "bread" "duck"`, `!creact remove "bread"`, `!creact list`],
			args: [
				{
					key: 'option',
					prompt: 'Would you like to `add`, `remove`, or `list` a custom reaction?',
					type: 'string',
					validate: (s) => {
						if (!s) return false;
						return ['add', 'remove', 'list'].includes(s.toLowerCase());
					},
					parse: (s) => s.toLowerCase(),
				},
				{
					key: 'trigger',
					prompt: 'What is the trigger for the reaction?',
					type: 'string',
					parse: (trigger) => trigger.toLowerCase().trim().replace(/`|\*|_|~/gi, ''),
					validate: (value, msg, currArg, prevArgs) => {
						if (prevArgs.option === 'list') return true;
						return value && value.length > 1;
					},
				},
				{
					key: 'content',
					prompt: 'What should be said in response to the trigger?',
					type: 'string',
					validate: (value, msg, currArg, prevArgs) => {
						if (prevArgs.option === 'list' || 'remove') return true;
						return value && value.length > 1;
					},
				},
			],
		});
	}

	async run(msg, {option, trigger, content}) {
		if (option === '') return msg.say('Please select an action.');
		const crExists = reactDB.findReact(msg, trigger);
		switch (option.toLowerCase()) {
		case 'add': {
			if (!msg.member.hasPermission('MANAGE_MESSAGES') && !this.client.isOwner(msg.author.id)) return msg.say('You need permission to manage messages in order to manage custom reacts.');
			if (trigger === '' || content === '' || trigger.replace(/ /g, '').length === 0 || content.replace(/ /g, '').length === 0) return msg.say('The custom reaction content or trigger can\'t be empty.'); // Because of default arguments, detecting an empty trigger or content when adding is necessary.
			if (crExists) return msg.say(`There is already a reaction with the trigger **${trigger}**.`); // return the error
			reactDB.addReact(msg, trigger, content);
			return reactDB.addToCache({
				guild: msg.guild.id,
				trigger: trigger,
				content: content,
			}).then(() => msg.say(`Reaction added, **${trigger}** will cause me to say **${content}**.`));
		}
		case 'edit': {
			if (!msg.member.hasPermission('MANAGE_MESSAGES') && !this.client.isOwner(msg.author.id)) return msg.say('You need permission to manage messages in order to manage custom reacts.');
			if (trigger === '' || content === '' || trigger.replace(/ /g, '').length === 0 || content.replace(/ /g, '').length === 0) return msg.say('The custom reaction content or trigger can\'t be empty.'); // Because of default arguments, detecting an empty trigger or content when adding is necessary.
			if (!crExists) return msg.say(`There is no custom reaction with the trigger **${trigger}**. Please add it with \`!creact add\` first.`);
			reactDB.editReact(msg, trigger, content);
			return reactDB.editInCache({
				guild: msg.guild.id,
				trigger: trigger,
				content: content,
			}).then(msg.say(`Reaction edited! I will now say **${content}** in response to **${trigger}**.`));
		}
		case 'remove': // 3 acceptable options to delete using fall-through.
		case 'delete':
		case 'del': {
			if (!msg.member.hasPermission('MANAGE_MESSAGES') && !this.client.isOwner(msg.author.id)) return msg.say('You need permission to manage messages in order to manage custom reacts.');
			if (!crExists) return msg.say(`There are no custom reactions with the trigger **${trigger}**...`); // Does not exist.
			reactDB.deleteReact(msg, trigger);
			return reactDB.removeFromCache({
				guild: msg.guild.id,
				trigger: trigger,
			}).then(msg.say(`Reaction deleted, I'll no longer respond to **${trigger}**.`));
		}
		case 'list': { // Lists the triggers in the guild.
			const reactArray = await reactDB.findAllForGuild(msg.guild.id);
			const triggerArray = reactArray.map((react) => {
				return react.trigger;
			});
			if (triggerArray.length === 0) return msg.say(`There are no custom reaction triggers in **${msg.guild.name}**.`); // No triggers response.
			return msg.say(`The list of custom reaction triggers in **${msg.guild.name}** is: \n\`\`\`${triggerArray.join(', ')}\`\`\``).catch(() => {
				const page = parseInt(trigger) || 1;
				if (page > Math.ceil(triggerArray.length/10)) return msg.say('That is not a valid page number.');
				const formattedArray = [`Reaction triggers: page ${page} of ${Math.ceil(triggerArray.length/10)}:\n`];
				for (let i = page*10-9; i<page*10+1; i++) {
					if (triggerArray[i-1]) formattedArray.push(`${i}. **${triggerArray[i-1]}**`);
				}
				return msg.say(formattedArray);
			});
		}
		default: msg.say('That isn\'t a valid option.'); break;
		}
	}
};
