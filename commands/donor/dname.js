const {Command} = require('discord.js-commando');
const donorDB = require('../../utils/models/donor.js');

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

	hasPermission(msg) {
		if (this.client.isOwner(msg.author)) return true;
		if (!msg.guild.me.hasPermission('MANAGE_ROLES')) return 'I need permission to manage roles in order to use this command.';
		return true;
	}

	async run(msg, args) {
		const {name} = args;
		const donors = await donorDB.getDonors(msg);
		const donor = donors.find(donor => donor.id === msg.author.id);
		if (donor === undefined) return msg.say('You don\'t have a donor color on this server!');
		msg.guild.roles.find('id', donor.role).setName(name)
			.then(() => msg.say('Your role name has been changed.'))
			.catch(() => msg.say('It looks like I don\'t have permission to manage your role. Please make sure my role is above yours.'));
	}
};
