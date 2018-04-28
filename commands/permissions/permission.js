const { Command } = require('discord.js-commando');
const permissions = require('../../utils/models/permissions.js');

module.exports = class PermissionCommand extends Command {
	constructor (client) {
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
						return ['allow', 'deny', 'show'].includes(s.toLowerCase());
					},
					parse: (s) => s.toLowerCase(),
				}, {
					key: 'command',
					prompt: 'Please specify the command.',
					type: 'string',
					default: '',
					validate: (value, msg, currArg, prevArgs) => {
						if (prevArgs.option === 'list') return true;
						return value;
					},
					parse: (s) => s.toLowerCase(),
				}, {
					key: 'targetType',
					prompt: 'Please specify the type.', // user, role, channel, guild
					default: '',
					type: 'string',
				}, {
					key: 'target',
					prompt: 'Please specify the target.',
					default: '',
					type: 'string',
				},
			],
		});
	}

	async run (msg, args) {
		let {action, command, targetType, target} = args;
		if (!command && action !== 'list') return msg.say('Please specify the command and try again');
		if (action !== 'list' && ![...this.client.registry.commands.keys()].includes(command)) return msg.say(`**${command}** is not recognised. Please check that you are not using an alias.`);
		if (action == 'deny' || action == 'allow') {
			if (!targetType || !['user', 'role', 'channel', 'guild'].includes(targetType)) return msg.say('Please specify the target type: **user**, **role**, **channel**, **guild**');
			if (!target && targetType !== 'guild') return msg.say('Please specify the target: a user, a role, or a channel');
			if (targetType == 'user') {
				let targetUser = parse(target, msg);
				if (!targetUser) return msg.say('User not found, please use a mention, username or ID.');
				target = targetUser.id;
			} else if (targetType == 'role') {
				let match = target.match(/^<@&(\d+)>$|^(\d+)$/);
				if (!match) return msg.say('Role not found, please use a role mention or ID.');
				let roleid = match.filter(m => !!m)[1];
				let role = msg.guild.roles.find('id', roleid);
				if (!role) return msg.say('Role not found, please use a role mention or ID.');
				target = roleid;
			} else if (targetType == 'channel') {
				let match = target.match(/^<#(\d+)>$|^(\d+)$/);
				if (!match) return msg.say('Please specify the channel (channel link or ID).');
				let channelid = match.filter(m => !!m)[1];
				let channel = msg.guild.channels.find('id', channelid);
				if (!channel) return msg.say('channel not found, please use a channel mention or ID.');
				target = channelid;
			}

			permissions.setPermission(msg, {
				guild: msg.guild.id,
				targetType: targetType,
				target: target,
				command: command,
				allow: [false, true][['deny', 'allow'].indexOf(action)],
			}).then(() => {
				msg.say(`Permission updated.`);
			});
		} else if (action == 'clear') {
			permissions.clearPermission(msg, {
				guild: msg.guild.id,
				targetType: targetType,
				target: target,
				command: command,
			});
		} else if (action == 'show') {
			permissions.showPermissions(msg, command).then((perms) => {
				let res = [];
				for (let i = 0; i < perms.length; i++) {
					let perm = perms[i];
					if (perm.targetType === 'user') {
						let guildMember = msg.guild.members.get(perm.target);
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
					let perm = perms[i];
					if (perm.targetType === 'role') {
						res.push(`${(perm.allow ? 'Allow' : 'Deny')} for role **${msg.guild.roles.get(perm.target).name}** (ID \`${perm.target}\`)`);
					}
				};
				for (let i = 0; i < perms.length; i++) {
					let perm = perms[i];
					if (perm.targetType === 'channel') {
						res.push(`${(perm.allow ? 'Allow' : 'Deny')} in channel: <#${perm.target}> (${msg.guild.channels.get(perm.target).name})`);
					}
				};
				for (let i = 0; i < perms.length; i++) {
					let perm = perms[i];
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
