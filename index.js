const { ShardingManager } = require('discord.js');
const managerCommands = require('./managerCommands');
const hotload = require('hotload');
const manager = new ShardingManager('./aeiou.js', { totalShards: 2 });

managerCommands.init().then(() => manager.spawn(manager.totalShards, 3000));

manager.on('message', (shard, m) => {
	if (m.command == 'reload') return hotload('./managerCommands');
	if (m.command) return shard.send(managerCommands[m.command](manager, shard, m.data));
});
