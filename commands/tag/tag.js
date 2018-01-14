const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'tag',
			aliases: ['t'],
			group: 'tag',
			memberName: 'tag',
			description: 'Show a tag',
			details: 'coming soon',
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
		let tags = provider.get(msg.guild, 'tags', []);
		let toSay = tags.find((tag) => {
			if (tagname == tag.trigger) return tag;
		});
		if (toSay) return msg.say(toSay.content);
		else msg.say(`Tag **${tagname}** does not exist!`);
	}
};
