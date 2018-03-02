const {Command} = require('discord.js-commando');

module.exports = class RestartCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'restart',
			group: 'owner',
			memberName: 'restart',
			description: 'Restarts this shard.',
			details: 'Restarts this shard.',
		});
	}

	hasPermission(msg) {
		if (this.client.isOwner(msg.author)) return true;
		return 'please don\'t.';
	}

	async run(msg) {
		console.log(`Shard ${msg.client.shard.id} restarting...`);
		msg.react('✅').then(() => process.exit(0));
	}
};
