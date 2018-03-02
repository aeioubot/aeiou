const { ShardingManager } = require('discord.js');
const managerCommands = require('./managerCommands');
const manager = new ShardingManager('./aeiou.js', { totalShards: 2 });

require('./utils/models/creact.js').buildReactCache().then(() => {
	console.log('[Manager] Reactions cache built!');
	manager.spawn(manager.totalShards, 3000);
});
require('./utils/models/plants').startTimer();
console.log('[Manager] All plant timers started!');

manager.on('message', (shard, m) => {
	if (m.command) return shard.send(managerCommands[m.command](manager, shard, m.data));
});
