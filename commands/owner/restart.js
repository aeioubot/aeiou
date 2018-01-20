const {Command} = require('discord.js-commando');
const child = require('child_process');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'restart',
			group: 'owner',
			memberName: 'restart',
			description: 'Restarts the bot.',
			details: 'Git pulls, npm installs, and restarts the bot.',
		});
	}

	async run(msg) {
		if (!this.client.isOwner(msg.author)) return msg.say('Please don\'t.');
		console.log('Pulling...');
		child.execSync('git pull');
		console.log('Pulling complete! Installing...');
		child.execSync('npm install');
		console.log('Install complete! Exiting.');
		process.exit(0);
	}
};
