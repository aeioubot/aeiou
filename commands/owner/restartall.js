const {Command} = require('discord.js-commando');

module.exports = class RestartCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'restartall',
			group: 'owner',
			memberName: 'restartall',
			description: 'Restarts the bot.',
			details: 'Git pulls, npm installs, and restarts the bot.',
		});
	}

	hasPermission(msg) {
		if (this.client.isOwner(msg.author)) return true;
		return 'Please don\'t.';
	}

	async run(msg) {
		msg.react('✅').then(() => msg.client.shard.send({command: 'restart'}));
	}
};
