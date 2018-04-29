const {Command} = require('discord.js-commando');

module.exports = class TagCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'tag',
			aliases: ['t'],
			group: 'tag',
			memberName: 'tag',
			description: 'Show a tag',
			details: 'Get the content of a tag in this guild.',
			examples: ['!tag cuteashecky'],
			format: '[tagname]',
			guildOnly: true,
			args: [
				{
					key: 'tagname',
					prompt: 'Which tag would you like to use?',
					type: 'string',
				},
			],
		});
	}

	async run(msg, args) {
		const {tagname} = args;
		if (msg.author.bot) return;
		const provider = this.client.provider;
		const tags = provider.get(msg.guild, 'tags', []);
		const toSay = tags.find((tag) => {
			if (tagname === tag.trigger) return tag;
		});
		if (toSay) return msg.say(toSay.content);
		msg.say(`Tag **${tagname}** does not exist!`);
	}
};
