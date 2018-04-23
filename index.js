const { ShardingManager } = require('discord.js');
const managerCommands = require('require-all')({
	dirname: `${__dirname}/managerCommands`,
	filter: n => n.slice(0, -3),
});

function onMessage(m) {
	if (!m.destinations || m.destinations.length == 0) manager.shards.map(s => s.process.send(m));
	m.destinations.map(id => manager.shards.get(id).process.send(m));
}

const manager = new ShardingManager('./aeiou.js', { totalShards: 2 });
managerCommands.init().then(() => manager.spawn(manager.totalShards, 2000));
manager.on('launch', shard => shard.process.on('message', m => onMessage(m)));
