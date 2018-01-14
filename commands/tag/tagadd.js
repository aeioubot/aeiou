const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'tagadd',
			group: 'tag',
			memberName: 'tagadd',
			description: 'Add a tag',
			details: '',
			examples: ['!tagadd "cuteashecky" "bep"', '!tagadd "cool" "{{args0}} is very cool"'],
			format: '[trigger] [content]',
			guildOnly: true,
			args: [
				{
					key: 'trigger',
					prompt: 'What would you like the tag name to be?',
					type: 'string',
				},
				{
					key: 'content',
					prompt: 'What should be in the tag content?',
					type: 'string',
				},
			],
		});
	}

	async run(msg, args) {
		const {trigger, content} = args;
		const provider = this.client.provider;
		let testIfTagExists = provider.get(msg.guild, 'tags', []).find((x) => {
			if (x.trigger == trigger) return x;
		});
		if (testIfTagExists) return msg.say(`There is already a tag with the trigger **${trigger}**!`);
		if (trigger == '' || content == '') return msg.say('The tag name and/or content can\'t be empty');
		let toBePushed = provider.get(msg.guild, 'tags', []);
		toBePushed.push({
			trigger: trigger,
			content: content,
			owner: msg.author.id,
		});
		provider.set(msg.guild, 'tags', toBePushed);
		return msg.say(`Tag **${trigger}** added!`);
	}
};
