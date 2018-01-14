const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'tagdel',
			group: 'tag',
			memberName: 'tagdel',
			description: '',
			details: '',
			examples: ['', ''],
			format: '[]',
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
		let testIfTagExists = provider.get(msg.guild, 'tags', []).find((x) => {
			if (x.trigger == trigger) return x;
		});
		if (!testIfTagExists) return msg.say(`There is no tag with the name **${trigger}**!`);
		let toBePushedDelete = provider.get(msg.guild, 'tags', []);
		let toDelete = toBePushedDelete.find((x) => {
			if (x.trigger == trigger) return x;
		});
		if (toDelete) {
			if (msg.author.id !== toDelete.owner) return msg.say('You can only delete tags you created!');
		}
		toBePushedDelete.splice(toBePushedDelete.indexOf(toDelete), 1);
		provider.set(msg.guild, 'customReactions', toBePushedDelete);
		return msg.say(`Tag **${trigger}** deleted!`);
	}
};
