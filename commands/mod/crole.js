const {Command} = require('discord.js-commando');
const permissions = require('../../utils/models/permissions.js');
const donorDB = require('../../utils/models/donor.js');

module.exports = class CRoleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'crole',
			group: 'mod',
			memberName: 'crole',
			description: 'Creates or deletes a user and role pair in order to allow them to interact with a custom role.',
			details: 'Creates or deletes a user and role pair in order to allow them to interact with a custom role.',
			examples: ['crole add <@87723984799399936> real qt korean gamer grill', 'crole remove <@245194516460601344> cheese filled'],
			format: '<add or remove> <username/mention> <rolename>',
			guildOnly: true,
			args: [
				{
					key: 'addOrRemove',
					prompt: 'Would you like to add or remove a custom color?',
					type: 'string',
				},
				{
					key: 'member',
					prompt: 'Which member do you want to add a role to?',
					type: 'member',
				},
				{
					key: 'role',
					prompt: 'Which role should the user be able to manage?',
					type: 'role',
				},
			],
		});
	}

	hasPermission(msg) {
		if (this.client.isOwner(msg.author)) return true;
		if (msg.member.hasPermission('MANAGE_ROLES')) return true;
		return 'you need permission to manage roles in order to manage donor colors.';
	}

	async run(msg, { addOrRemove, member, role }) {
		if (!await permissions.hasPermission(this.name, msg)) return msg.say(`You don't have permission to use this command.`);
		addOrRemove = addOrRemove.toLowerCase();

		if (['add', 'plus', 'give', 'create'].includes(addOrRemove)) {
			const oldDonors = await donorDB.getDonors(msg);
			const existCheck = oldDonors.find((donorObject) => donorObject.id == member.id && donorObject.role == role.id);
			if (existCheck) return msg.say(`**${member.displayName}** can already manage the role \`${role.name}\``);
			oldDonors.push({
				id: member.id,
				role: role.id,
			});
			donorDB.setDonors(msg, oldDonors);
			return msg.say(`Done! **${member.displayName}** can now manage the role \`${role.name}\``);
		}

		if (['remove', 'take', 'remove', 'delete', 'del'].includes(addOrRemove)) {
			const oldDonors = await donorDB.getDonors(msg);
			const toSpliceIndex = oldDonors.findIndex((donor) => donor.id === member.id && donor.role === role.id);
			if (toSpliceIndex === -1) return msg.say(`**${member.displayName}** is already unable to manage \`${role.name}\`.`);
			oldDonors.splice(toSpliceIndex, 1);
			donorDB.setDonors(msg, oldDonors);
			return msg.say(`Done! **${member.displayName}** can no longer manage the role \`${role.name}\``);
		}
		return msg.say(`Please use 'add' or 'remove' as your first argument.`);
	}
};
