const { ShardingManager } = require('discord.js');
const managerCommands = require('require-all')({
	dirname: `${__dirname}/managerCommands`,
	filter: n => n.slice(0, -3),
});
const manager = new ShardingManager('./aeiou.js', { totalShards: 2 });
managerCommands.init().then(() => manager.spawn(manager.totalShards, 3000));

// manager.on('message', (shard, m) => {
// 	if (m.command) return shard.send(managerCommands[m.command](manager, shard, m.data));
// });

process.on('message', (m) => {
	if (!m.destination || m.destination.length == 0) manager.shards.forEach(s => s.send(m));
	m.destination.forEach(id => manager.shards[id].send(m));
});
