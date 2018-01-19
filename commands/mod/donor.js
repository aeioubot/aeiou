const {Command} = require('discord.js-commando');

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
		return 'You need permission to manage roles in order to manage donor colors.';
	}

	determineMode(str) {
		const addStrings = ['add', 'plus', 'give', 'create'];
		const removeStrings = ['remove', 'take', 'remove', 'delete', 'del'];
		str = str.toLowerCase();
		for (let i = 0; i < addStrings.length; i++) {
			if (str.indexOf(addStrings[i]) === 0) return 'add';
		}
		for (let i = 0; i < removeStrings.length; i++) {
			if (str.indexOf(removeStrings[i]) === 0) return 'remove';
		}
		return null;
	}

	appendToSettings(msg, item) {
		const toSet = this.client.provider.get(msg.guild.id, 'donorColors', []);
		toSet.push(item);
		this.client.provider.set(msg.guild.id, 'donorColors', toSet);
	}

	async run(msg, { addOrRemove, member, role }) {
		const mode = this.determineMode(addOrRemove);
		if (mode == null) return msg.say(`Please use 'add' or 'remove' as your first argument.'`);

		if (mode === 'add') {
			this.appendToSettings(msg, {
				user: member.id,
				role: role.id,
			});
			return msg.say(`Done! **${member.displayName}** can now manage the role \`${role.name}\``);
		}

		if (mode === 'remove') {
			const userArray = this.client.provider.get(msg.guild.id, 'donorColors', []);
			const toSpliceIndex = userArray.findIndex(donor => donor.id === member.id && donor.role === role.id);
			if (toSpliceIndex === -1) return msg.say(`**${member.displayName}** is already unable to manage \`${role.name}\`.`);
			userArray.splice(toSpliceIndex, 1);
			this.client.provider.set(msg.guild.id, 'donorColors', userArray);
			return msg.say(`Done! **${member.displayName}** can no longer manage the role \`${role.name}\``);
		}
	}
};
