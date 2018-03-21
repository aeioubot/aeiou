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
					parse: (trigger) => trigger.toLowerCase().trim().replace(/`|\*|_|~/gi, ''),
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

	async run(msg, {option, trigger, content}) {
		if (option === '') return msg.say('Please select an action.');
		const reactArray = await reactDB.getReacts(msg);
		const crExists = reactArray.find((x) => {
			if (x.trigger === trigger) return true;
		});
		switch (option.toLowerCase()) {
		case 'add': {
			if (!msg.member.hasPermission('MANAGE_MESSAGES') && !this.client.isOwner(msg.author.id)) return msg.say('You need permission to manage messages in order to manage custom reacts.');
			if (trigger === '' || content === '' || trigger.replace(/ /g, '').length === 0 || content.replace(/ /g, '').length === 0) return msg.say('The custom reaction content or trigger can\'t be empty.'); // Because of default arguments, detecting an empty trigger or content when adding is necessary.
			if (crExists) return msg.say(`There is already a reaction with the trigger **${trigger}**...`); // return the error
			reactDB.appendToReacts(msg, {
				trigger: trigger,
				content: content,
			});
			return reactDB.addToCache(msg.guild.id, {
				trigger: trigger,
				content: content,
			}).then(() => msg.say(`Reaction added, **${trigger}** will cause me to say **${content}**.`));
		}

		case 'remove': // 3 acceptable options to delete using fall-through.
		case 'delete':
		case 'del': {
			if (!msg.member.hasPermission('MANAGE_MESSAGES') && !this.client.isOwner(msg.author.id)) return msg.say('You need permission to manage messages in order to manage custom reacts.');
			if (!crExists) return msg.say(`There are no custom reactions with the trigger **${trigger}**...`); // Does not exist.
			reactArray.splice(reactArray.indexOf(crExists), 1);
			return reactDB.setReacts(msg, reactArray).then(() => reactDB.removeFromCache(msg.guild.id, trigger))
				.then(msg.say(`Reaction deleted, I'll no longer respond to **${trigger}**.`));
		}
		case 'list': { // Lists the triggers in the guild.
			const triggerArray = [];
			reactArray.map((item) => {
				triggerArray.push(item.trigger);
			});
			if (triggerArray.length === 0) return msg.say(`There are no custom reaction triggers in **${msg.guild.name}**.`); // No triggers response.
			return msg.say(`The list of custom reaction triggers in **${msg.guild.name}** are: \n\`\`\`${triggerArray.join(', ')}\`\`\``).catch(() => {
				const page = parseInt(trigger) || 1;
				if (page > Math.ceil(triggerArray.length/10)) return msg.say('That is not a valid page number.');
				let formattedArray = [`Reaction triggers: page ${page} of ${Math.ceil(triggerArray.length/10)}:\n`];
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
