
const {Command} = require('discord.js-commando');

module.exports = class ShardsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'shards',
			group: 'misc',
			memberName: 'shards',
			description: 'Shows data for all shards.',
			details: 'Shows data for all shards.',
		});
	}

	async run(msg, args) {
		return this.client.shard.broadcastEval(
			`({
				id: this.shard.id,
				totalMembers: this.guilds.map((g) => g.memberCount).reduce((a, b) => a + b, 0),
				totalGuilds: this.guilds.size,
				totalChannels: this.channels.size,
			})`
		).then((data) => {
			const message = ['```md\n#Shard          Members          Guilds          Channels'];
			let totals = {
				Members: 0,
				Guilds: 0,
				Channels: 0,
			};
			data.forEach((d, ind) => {
				totals.Members += d.totalMembers;
				totals.Guilds += d.totalGuilds;
				totals.Channels += d.totalChannels;
				message.push(`${ind == this.client.shard.id ? '#' : ' '}${d.id.toString().padEnd(15, ' ')}${d.totalMembers.toString().padEnd(17, ' ')}${d.totalGuilds.toString().padEnd(17, ' ')}${d.totalChannels.toString().padEnd(17, ' ')}`);
			});
			message.push(`#${'Total'.padEnd(15, ' ')}${totals.Members.toString().padEnd(17, ' ')}${totals.Guilds.toString().padEnd(17, ' ')}${totals.Channels.toString().padEnd(17, ' ')}`);
			message.push('```');
			msg.say(message);
		});
	}
};
