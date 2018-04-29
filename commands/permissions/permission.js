const { stripIndents } = require('common-tags');
const { Command } = require('discord.js-commando');
const permissions = require('../../utils/models/permissions.js');
const channelType = new (require('discord.js-commando/src/types/channel.js'))(this);
const userType = new (require('discord.js-commando/src/types/user.js'))(this);
const roleType = new (require('discord.js-commando/src/types/role.js'))(this);

function disambiguation(items, label, property = 'name') {
	const itemList = items.map(item => `"${(property ? item[property] : item).replace(/ /g, '\xa0')}"`).join(',   ');
	return `Multiple ${label} found, please be more specific: ${itemList}`;
}

module.exports = class PermissionCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'permission',
			aliases: ['perms', 'perm'],
			group: 'permissions',
			memberName: 'permission',
			description: 'Allow or deny command permissions to a user, role, channel or the entire guild.',
			details: 'The order of importance (more to less) is: user, role, channel, guild. For example, if a command is allowed to [role], but denied to [user], the user will not be able to use it.',
			examples: ['perms deny image guild', 'perms allow image channel #bot-commands', 'perms deny ping user @user#1234'],
			format: '[allow|deny|show] <command> [user|role|channel|guild] <target>',
			guildOnly: true,
			args: [
				{
					key: 'action',
					prompt: 'Please specify allow, deny or show.',
					type: 'string',
					validate: (s) => {
						if (!s) return false;
						return ['allow', 'deny', 'show', 'clear', 'list'].includes(s.toLowerCase());
					},
					parse: (s) => s.toLowerCase(),
				}, {
					key: 'command',
					prompt: 'Please specify the command.',
					type: 'string',
					validate: (val, msg, currArg, prevArgs) => {
						if (!val) return false;
						//const groups = this.client.registry.findGroups(val);
						//if (groups.length === 1) return true;
						const commands = this.client.registry.findCommands(val);
						if (commands.length === 1) return true;
						if (commands.length === 0/* && groups.length === 0*/) return false;
						return stripIndents`
							${commands.length > 1 ? disambiguation(commands, 'commands') : ''}
							${/*groups.length > 1 ? disambiguation(groups, 'groups') : ''*/''}
						`;
					},
					parse: val => /*this.client.registry.findGroups(val)[0] ||*/ this.client.registry.findCommands(val)[0],
				}, {
					key: 'targetType',
					prompt: 'Please specify the type.', // user, role, channel, guild
					type: 'string',
					validate: (value, msg, currArg, prevArgs) => {
						if (['show', 'list'].includes(prevArgs.action)) return true;
						if (!value) return false;
						return ['user', 'role', 'channel', 'guild'].includes(value.toLowerCase());
					},
					parse: (s) => s.toLowerCase(),
				}, {
					key: 'target',
					prompt: 'Please specify the target.',
					type: 'string',
					validate: (value, msg, currArg, prevArgs) => {
						if (['show', 'list'].includes(prevArgs.action)) return true;
						if (prevArgs.targetType === 'guild') return true;
						if (!value) return false;
						let validated = false;
						switch (prevArgs.targetType) {
						case 'user':
							return userType.validate(value, msg).then((x) => {
								validated = x;
								console.log(validated);
								if (typeof validated === 'string' && validated.indexOf('Multiple users found') === 0) {
									currArg.reprompt = validated;
									return false;
								}
								return validated;
							});
						case 'role':
							validated = roleType.validate(value, msg);
							if (typeof validated === 'string' && validated.indexOf('Multiple roles found') === 0) {
								currArg.reprompt = validated;
								return false;
							}
							return validated;
						case 'channel':
							validated = channelType.validate(value, msg);
							if (typeof validated === 'string' && validated.indexOf('Multiple channels found') === 0) {
								currArg.reprompt = validated;
								return false;
							}
							return validated;
						}
						return false;
					},
					parse: (value, msg, currArg, prevArgs) => {
						if (['show', 'list'].includes(prevArgs.action)) return true;
						switch (prevArgs.targetType) {
						case 'user':
							return userType.parse(value, msg.message);
						case 'role':
							console.log('rollll', roleType.parse(value, msg.message))
							return roleType.parse(value, msg.message);
						case 'channel':
							return channelType.parse(value, msg.message);
						}
					},
				},
			],
		});
	}

	async run(msg, args) {
		let { action, command, targetType, target } = args;
		command = command.name;
		if (action !== 'list' && ![...this.client.registry.commands.keys()].includes(command)) return msg.say(`**${command}** is not recognised. Please check that you are not using an alias.`);
		if (action == 'deny' || action == 'allow') {
			// if (!target && targetType !== 'guild') return msg.say('Please specify the target: a user, a role, or a channel');
			console.log('target', target);
			if (['user', 'role', 'channel'].includes(targetType)) target = target.id;
			permissions.setPermission(msg, {
				guild: msg.guild.id,
				targetType: targetType,
				target: target,
				command: command,
				allow: [false, true][['deny', 'allow'].indexOf(action)],
			}).then(() => {
				msg.say(`Permission updated: **${action}** usage of **${command}** to **${targetType}**:**${target}**`);
			});
		} else if (action == 'clear') {
			if (['user', 'role', 'channel'].includes(targetType)) target = target.id;
			permissions.clearPermission(msg, {
				guild: msg.guild.id,
				targetType: targetType,
				target: target,
				command: command,
			}).then(() => {
				msg.say(`Permission to use **${command}** reset to default for ${target}`);
			});
		} else if (action == 'show') {
			permissions.showPermissions(msg, command).then((perms) => {
				const res = [];
				for (let i = 0; i < perms.length; i++) {
					const perm = perms[i];
					if (perm.targetType === 'user') {
						const guildMember = msg.guild.members.get(perm.target);
						let memberTag;
						if (guildMember) {
							memberTag = guildMember.user.tag;
						} else {
							memberTag = '[user left guild]';
						}
						res.push(`${(perm.allow ? 'Allow' : 'Deny')} for user: **${memberTag}** (ID \`${perm.target}\`)`);
					}
				};
				for (let i = 0; i < perms.length; i++) {
					const perm = perms[i];
					if (perm.targetType === 'role') {
						res.push(`${(perm.allow ? 'Allow' : 'Deny')} for role **${msg.guild.roles.get(perm.target).name}** (ID \`${perm.target}\`)`);
					}
				};
				for (let i = 0; i < perms.length; i++) {
					const perm = perms[i];
					if (perm.targetType === 'channel') {
						res.push(`${(perm.allow ? 'Allow' : 'Deny')} in channel: <#${perm.target}> (${msg.guild.channels.get(perm.target).name})`);
					}
				};
				for (let i = 0; i < perms.length; i++) {
					const perm = perms[i];
					if (perm.targetType === 'guild') {
						res.push(`${(perm.allow ? 'Allow' : 'Deny')} in guild`);
					}
				};
				if (res.length > 0) msg.say('Here are the configured permissions for **' + command + '**:\n\n' + res.join('\n'));
				else msg.say(`There are no configured permissions for **${command}**.`);
			});
		} else if (action == 'list') {
			permissions.getList(msg).then((list) => {
				msg.say('There are permissions set up for: **' + list.join(', ') + '**');
			});
		} else {
			msg.say('Unknown action! Please choose **allow**, **deny** or **show**.');
		}
	}
};


// From https://github.com/discordjs/Commando/blob/d372527e73b3378810d64ccae48f42a1a84ddbfb/src/types/user.js

function parse(value, msg) {
	const matches = value.match(/^(?:<@!?)?([0-9]+)>?$/);
	if (matches) return msg.client.users.get(matches[1]) || null;
	if (!msg.guild) return null;
	const search = value.toLowerCase();
	const members = msg.guild.members.filterArray(memberFilterInexact(search));
	if (members.length === 0) return null;
	if (members.length === 1) return members[0].user;
	const exactMembers = members.filter(memberFilterExact(search));
	if (exactMembers.length === 1) return exactMembers[0].user;
	return null;
}

function memberFilterExact(search) {
	return (mem) => mem.user.username.toLowerCase() === search ||
		(mem.nickname && mem.nickname.toLowerCase() === search) ||
		`${mem.user.username.toLowerCase()}#${mem.user.discriminator}` === search;
}

function memberFilterInexact(search) {
	return (mem) => mem.user.username.toLowerCase().includes(search) ||
		(mem.nickname && mem.nickname.toLowerCase().includes(search)) ||
		`${mem.user.username.toLowerCase()}#${mem.user.discriminator}`.includes(search);
}
