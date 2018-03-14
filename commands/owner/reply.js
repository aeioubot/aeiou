const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reply',
			group: 'owner',
			memberName: 'reply',
			description: 'replies',
			details: 'Replies to a DM message.',
			examples: ['!reply 1 ok', '!reply 23 no i dont'],
			format: '[ID] [content]',
			guildOnly: true,
			args: [
				{
					key: 'id',
					prompt: 'Which message would you like to reply to?',
					type: 'integer',
				},
				{
					key: 'content',
					prompt: 'What would you like to say?',
					type: 'string',
					default: '',
				},
			],
		});
	}

	hasPermission(msg) {
		return this.client.isOwner(msg.author);
	}

	async run(msg, { id, content }) {
		return this.client.dmManager.reply(id, content, msg);
	}
};
