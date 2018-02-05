const {Command} = require('discord.js-commando');
const donorDB = require('../../utils/models/donor.js');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'donor',
			group: 'mod',
			memberName: 'donor',
			description: 'Creates or deletes a user and role pair in order to allow them to interact with the name and color.',
			details: 'Creates or deletes a user and role pair in order to allow them to interact with the name and color.',
			examples: ['dcolor add <@87723984799399936> real qt korean gamer grill', 'dcolor remove <@245194516460601344> cheese filled'],
			format: '<add or remove> <username/mention> <rolename>',
			guildOnly: true,
			args: [
				{
					key: 'addOrRemove',
					prompt: 'Would you like to add or remove a donor color?',
					type: 'string',
					format: '[add or remove]',
				},
				{
					key: 'member',
					prompt: 'Which member do you want to add a role to?',
					type: 'member',
					format: '[member]',
				},
				{
					key: 'role',
					prompt: 'Which role does the user get?',
					type: 'role',
					format: '[role]',
				},
			],
		});
	}

	hasPermission(msg) {
		if (msg.member.hasPermission('MANAGE_ROLES')) return true;
		return 'you need permission to manage roles in order to manage donor colors.';
	}

	async run(msg, { addOrRemove, member, role }) {
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
