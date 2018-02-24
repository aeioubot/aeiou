const child = require('child_process');

module.exports = (manager) => {
	console.log('Pulling...');
	child.execSync('git pull');
	console.log('Pulling complete! Installing...');
	child.execSync('npm install --production --silent');
	console.log('Install complete! Exiting.');
	process.exit(0);
};
