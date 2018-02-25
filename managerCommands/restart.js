const child = require('child_process');

module.exports = async (manager) => {
	manager.respawn = false;
	console.log('Pulling...');
	child.execSync('git pull');
	console.log('Pulling complete! Installing...');
	child.execSync('npm install --production --silent');
	console.log('Install complete! Killing children.');
	manager.broadcastEval('process.exit(0)').then(() => {
		console.log('Children dead, killing self.');
		process.exit(0);
	});
};
