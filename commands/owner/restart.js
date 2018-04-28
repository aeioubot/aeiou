const {Command} = require('discord.js-commando');
const GatewayCommand = require('../../utils/classes/GatewayCommand.js');
const child = require('child_process');

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
			await msg.react('⌛');
			console.log(`[Shard ${this.client.shard.id}] Pulling...`);
			child.execSync('git pull');
			console.log(`[Shard ${this.client.shard.id}] Pulling complete! Installing...`);
			child.execSync('npm install --production --silent');
			console.log(`[Shard ${this.client.shard.id}] Install complete! Killing my friends.`);
			return msg.react('✅').then(() => process.send(new GatewayCommand(
				this.client.shard.count,
				this.client.shard.id,
				'restart',
			)));
		}
		console.log(`[Shard ${msg.client.shard.id}] restarting...`);
		return msg.react('✅').then(() => process.exit(0));
	}
};
