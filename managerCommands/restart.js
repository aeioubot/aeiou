const child = require('child_process');

module.exports = async (manager) => {
	console.log('[Manager] Reactions cache built!');
	console.log('[Manager] Pulling...');
	child.execSync('git pull');
	console.log('[Manager] Pulling complete! Installing...');
	child.execSync('npm install --production --silent');
	console.log('[Manager] Install complete! Killing children.');
	manager.shards.map((value, index) => {
		setTimeout(() => {
			console.log(`[Shard ${index}] Restarting...`);
			value.eval('process.exit(0)');
		}, index * 3000);
	});
};
