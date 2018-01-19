const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'taglist',
			group: 'tag',
			memberName: 'taglist',
			description: '',
			details: '',
			examples: ['', ''],
			format: '[]',
			guildOnly: true,
		});
	}

	async run(msg) {
		const provider = this.client.provider;
		let tags = provider.get(msg.guild, 'tags', []);
		tags = tags.map(tag => tag.trigger).join(', ');
		msg.say(`Tag list: \`\`\`fix\n${tags}\`\`\``);
	}
};
