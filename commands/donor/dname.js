const {Command} = require('discord.js-commando');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'dname',
			group: 'donor',
			memberName: 'dname',
			description: 'Changes the name of a donator\'s role.',
			details: 'Changes the name of a donator\'s role.',
			examples: ['dname Cozy', 'dname Terran, destroyer of dirty aliens.'],
			format: '[name]',
			guildOnly: true,
			args: [
				{
					key: 'name',
					prompt: 'What would you like your role\'s name to be?',
					type: 'string',
					format: '[name]',
				},
			],
		});
	}

	async run(msg, args) {
		const {name} = args;
		const donors = this.client.provider.get(msg.guild.id, 'donorColors', []);
		const donor = donors.find(donor => donor.user === msg.author.id);
		if (donor === undefined) return msg.say('You don\'t have a donor color on this server!');
		msg.guild.roles.find('id', donor.role).setName(name);
		return msg.say('Your role name has been changed.');
	}
};
