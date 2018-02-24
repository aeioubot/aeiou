const { ShardingManager } = require('discord.js');
const manager = new ShardingManager('./aeiou.js', { totalShards: 2 });
const managerCommands = require('./managerCommands');

manager.spawn(manager.totalShards, 3000);
manager.on('launch', (shard) => console.log(`Successfully launched shard ${shard.id}`));
manager.on('message', (shard, m) => {
	if (m.command) return shard.send(managerCommands[m.command](manager, m.data));
});
