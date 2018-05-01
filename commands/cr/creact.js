const {Command} = require('discord.js-commando');
const reactDB = require('../../utils/models/creact.js');
const permissions = require('../../utils/models/permissions');

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
						return value && value.length >= 1;
					},
				},
				{
					key: 'content',
					prompt: 'What should be said in response to the trigger?',
					type: 'string',
					validate: (value, msg, currArg, prevArgs) => {
						if (prevArgs.option === 'list' || prevArgs.option === 'remove') return true;
						if (prevArgs.option === 'add' && !value) return false;
						return value && value.length >= 1;
					},
				},
			],
		});
	}

	async run(msg, { option, trigger, content }) {
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
				const crList = new (require('./crlist.js'))(this.client);
				return permissions.hasPermission(crList, msg).then(r => {
					if (!r && msg.channel.type !== 'dm' && !this.client.isOwner(msg.author.id)) {
						msg.react('🙅');
						return;
					}
					return crList.run(msg, trigger);
				});
			}
			default: msg.say('That isn\'t a valid option.'); break;
		}
	}
};
