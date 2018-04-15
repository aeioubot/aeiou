const {Command} = require('discord.js-commando');
const permissions = require('../../utils/models/permissions.js');

module.exports = class TagListCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'taglist',
			group: 'tag',
			memberName: 'taglist',
			description: 'Lists the tags available in the guild.',
			details: '',
			examples: ['', ''],
			format: '[]',
			guildOnly: true,
		});
	}

	async run(msg) {
		if (!await permissions.hasPermission(this.name, msg)) return msg.say(`You don't have permission to use this command.`);
		const provider = this.client.provider;
		let tags = provider.get(msg.guild, 'tags', []);
		tags = tags.map((tag) => tag.trigger).join(', ');
		msg.say(`Tag list: \`\`\`fix\n${tags}\`\`\``);
	}
};
