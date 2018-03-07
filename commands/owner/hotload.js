const {Command} = require('discord.js-commando');
const {reloadRequires} = require('../../aeiou.js');
const child = require('child_process');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'hotload',
			group: 'owner',
			memberName: 'hotload',
			description: 'Reloads message listeners and all commands.',
			details: 'Reloads message listeners and all commands.',
			guildOnly: true,
		});
	}

	async run(msg, args) {
		child.execSync('git pull');
		child.execSync('npm install --production --silent');
		reloadRequires().then(() => {
			msg.say('ok done');
		});
	}
};
