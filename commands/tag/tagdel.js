const {Command} = require('discord.js-commando');

module.exports = class TagDelCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'tagdel',
			group: 'tag',
			memberName: 'tagdel',
			description: 'Delete a tag',
			details: 'Delete a tag in the guild.',
			examples: ['tagdel thing'],
			format: '[tagname]',
			guildOnly: true,
			args: [
				{
					key: 'trigger',
					prompt: 'Which tag would you like to delete?',
					type: 'string',
				},
			],
		});
	}

	async run(msg, args) {
		const {trigger} = args;
		const provider = this.client.provider;
		const testIfTagExists = provider.get(msg.guild, 'tags', []).find((x) => {
			if (x.trigger === trigger) return x;
		});
		if (!testIfTagExists) return msg.say(`There is no tag with the name **${trigger}**!`);
		const toBePushedDelete = provider.get(msg.guild, 'tags', []);
		const toDelete = toBePushedDelete.find((x) => {
			if (x.trigger === trigger) return x;
		});
		if (toDelete) {
			if (msg.author.id !== toDelete.owner) return msg.say('You can only delete tags you created!');
		}
		toBePushedDelete.splice(toBePushedDelete.indexOf(toDelete), 1);
		provider.set(msg.guild, 'customReactions', toBePushedDelete);
		return msg.say(`Tag **${trigger}** deleted!`);
	}
};
