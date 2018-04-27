const {Command} = require('discord.js-commando');
const GatewayCommand = require('../../utils/classes/GatewayCommand.js');

module.exports = class RestartCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'restart',
			group: 'owner',
			memberName: 'restart',
			description: 'Restarts this shard.',
			details: 'Restarts this shard.',
			args: [
				{
					key: 'all',
					prompt: 'ksrt',
					type: 'string',
					default: '',
				},
			],
		});
	}

	hasPermission(msg) {
		if (this.client.isOwner(msg.author)) return true;
		return 'please don\'t.';
	}

	async run(msg, {all}) {
		if (all == 'all') {
			return msg.react('✅').then(() => process.send(new GatewayCommand(
				this.client.shard.count,
				this.client.shard.id,
				'restart',
			)));
		}
		console.log(`Shard ${msg.client.shard.id} restarting...`);
		return msg.react('✅').then(() => process.exit(0));
	}
};
