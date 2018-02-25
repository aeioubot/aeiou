
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
			const message = ['```md\n#Shard            Members            Guilds            Channels'];
			let totals = {
				Members: 0,
				Guilds: 0,
				Channels: 0,
			};
			data.forEach((d) => {
				totals.Members += d.totalMembers;
				totals.Guilds += d.totalGuilds;
				totals.Channels += d.totalChannels;
				message.push(` ${d.id.toString().padEnd(17, ' ')}${d.totalMembers.toString().padEnd(19, ' ')}${d.totalGuilds.toString().padEnd(18, ' ')}${d.totalChannels.toString().padEnd(18, ' ')}`);
			});
			message.push(`#${'Total'.padEnd(17, ' ')}${totals.Members.toString().padEnd(19, ' ')}${totals.Guilds.toString().padEnd(18, ' ')}${totals.Channels.toString().padEnd(18, ' ')}`);
			message.push('```');
			msg.say(message);
		});
	}
};
