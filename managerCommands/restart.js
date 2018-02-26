const child = require('child_process');

module.exports = async (manager) => {
	require('../utils/models/creact.js').buildReactCache().then(() => {
		console.log('[Manager] Reactions cache built!');
		console.log('[Manager] Pulling...');
		child.execSync('git pull');
		console.log('[Manager] Pulling complete! Installing...');
		child.execSync('npm install --production --silent');
		console.log('[Manager] Install complete! Killing children.');
		manager.broadcastEval('process.exit(0)');
	});
};
