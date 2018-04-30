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
			details: `The order of importance (more to less) is: user > role > channel > guild and command > group > *.
For example, if a command is allowed to [role], but denied to [user], the user will not be able to use it.
Likewise, if a command group (let's say "group:fun") is denied, but a single command (for example, "pacman") is allowed, all commands in the group are denied except for "pacman".`,
			examples: ['perms deny image guild',
				'perms allow image channel #bot-commands',
				'perms deny group:fun user @user#1234',
				'perms clear group:fun',
				'perms default ping user @user#1234',
			],
			format: '[allow|deny|default|clear|show] <command|command group|*> [user|role|channel|guild] <target>',
			guildOnly: true,
			args: [
				{
					key: 'action',
					prompt: 'Would you like to `allow`, `deny`, or `list` permissions?',
					type: 'string',
					validate: (s) => {
						if (!s) return false;
						return ['allow', 'deny', 'show', 'clear', 'list', 'default'].includes(s.toLowerCase());
					},
					parse: (s) => s.toLowerCase(),
				}, {
					key: 'command',
					prompt: 'Which command would you like to change permissions for?',
					type: 'string',
					validate: (val, msg, currArg, prevArgs) => {
						if (val === '*' || ['list', 'show'].includes(prevArgs.action)) return true;
						if (!val) return false;
						let groups = [];
						if (val.startsWith('group:')) {
							val = val.substr(6);
							groups = this.client.registry.findGroups(val);
							if (groups.length === 1) return true;
						}
						const commands = this.client.registry.findCommands(val);
						if (commands.length === 1) return true;
						if (commands.length === 0 && groups.length === 0) return false;
						return stripIndents`
							${commands.length > 1 ? disambiguation(commands, 'commands') : ''}
							${groups.length > 1 ? disambiguation(groups, 'groups') : ''}
						`;
					},
					parse: val => val === '*' ? '*' : ((val.indexOf('group:') === 0 ? this.client.registry.findGroups(val.substr(6))[0] : false) || this.client.registry.findCommands(val)[0]),
				}, {
					key: 'targetType',
					prompt: 'Who would you like to change permissions for? Please specify either `user`, `role`, `channel`, `guild`.', // user, role, channel, guild
					type: 'string',
					validate: (value, msg, currArg, prevArgs) => {
						if (['show', 'list', 'clear'].includes(prevArgs.action)) return true;
						if (!value) return false;
						return ['user', 'role', 'channel', 'guild'].includes(value.toLowerCase());
					},
					parse: (s) => s.toLowerCase(),
				}, {
					key: 'target',
					prompt: 'Please specify the target.',
					type: 'string',
					validate: (value, msg, currArg, prevArgs) => {
						if (['show', 'list', 'clear'].includes(prevArgs.action) || prevArgs.targetType === 'guild') return true;
						if (!value) return false;
						let validated = false;
						switch (prevArgs.targetType) {
							case 'user':
								return userType.validate(value, msg).then((x) => {
									validated = x;
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
		/* eslint-disable-next-line */
		let { action, command, targetType, target } = args;
		let commandType;
		if (command && command !== '*') {
			commandType = command.constructor.name === 'CommandGroup' ? 'group' : 'command';
			if (commandType === 'command') command = command.name;
			else if (commandType === 'group') command = 'group:' + command.id;
		}
		if (action == 'deny' || action == 'allow') {
			if (['user', 'role', 'channel'].includes(targetType)) target = target.id;
			if (command === 'permission' && action === 'deny') return msg.say('You cannot deny permission to use the `permission` command.');
			permissions.setPermission(msg, {
				guild: msg.guild.id,
				targetType: targetType,
				target: target,
				command: command,
				allow: [false, true][['deny', 'allow'].indexOf(action)],
			}).then(() => {
				msg.say(`Permission updated: **${action}** usage of \`${command}\` to ${fancyTarget(target, targetType, msg)}`);
			});
		} else if (action == 'default') {
			if (['user', 'role', 'channel'].includes(targetType)) target = target.id;
			permissions.defaultPermission(msg, {
				guild: msg.guild.id,
				targetType: targetType,
				target: target,
				command: command,
			}).then(() => {
				msg.say(`Permission to use \`${command}\` reset to default for ${fancyTarget(target, targetType, msg)}`);
			});
		} else if (action == 'clear') {
			permissions.clearPermission(msg, {
				guild: msg.guild.id,
				command: command,
			}).then(() => {
				msg.say(`All permissions set for \`${command}\` have been reset to default.`);
			});
		} else if (action == 'show' || action == 'list') {
			if (command) {
				permissions.showPermissions(msg, command).then((perms) => {
					const res = [[], [], [], []];
					let found = false;
					perms.forEach((perm) => {
						switch (perm.targetType) {
							case 'user':
								res[0].push(`${(perm.allow ? 'Allow' : 'Deny')} to ${fancyTarget(perm.target, perm.targetType, msg)}`);
								found = true;
								break;
							case 'role':
								res[1].push(`${(perm.allow ? 'Allow' : 'Deny')} to ${fancyTarget(perm.target, perm.targetType, msg)}`);
								found = true;
								break;
							case 'channel':
								res[2].push(`${(perm.allow ? 'Allow' : 'Deny')} in ${fancyTarget(perm.target, perm.targetType, msg)}`);
								found = true;
								break;
							case 'guild':
								res[3].push(`${(perm.allow ? 'Allow' : 'Deny')} in ${fancyTarget(perm.target, perm.targetType, msg)}`);
								found = true;
								break;
						}
					});
					if (found) {
						msg.say({
							embed: {
								title: 'Here are the configured permissions for *' + command + '*:',
								description: res.map(x => x.join('\n')).join('\n').replace(/\n+/g, '\n'),
								color: msg.guild.me.displayColor || 16743889,
							},
						});
					} else msg.say(`There are no configured permissions for **${command}**.`);
				});
			} else {
				permissions.getList(msg).then((list) => {
					const fields = [];
					const commands = {};
					const orderOfImportance = ['user', 'role', 'channel', 'guild'];
					list.sort((a, b) => {
						return orderOfImportance.indexOf(a.targetType) - orderOfImportance.indexOf(b.targetType);
					});
					list.forEach(perm => {
						if (!commands[perm.command]) commands[perm.command] = [];
						let txt;
						switch (perm.targetType) {
							case 'user':
								txt = `${['Deny', 'Allow'][+perm.allow]} to ${fancyTarget(perm.target, perm.targetType, msg)}`; break;
							case 'role':
								txt = `${['Deny', 'Allow'][+perm.allow]} to ${fancyTarget(perm.target, perm.targetType, msg)}`; break;
							case 'channel':
								txt = `${['Deny', 'Allow'][+perm.allow]} in ${fancyTarget(perm.target, perm.targetType, msg)}`; break;
							case 'guild':
								txt = `${['Deny', 'Allow'][+perm.allow]} in ${fancyTarget(perm.target, perm.targetType, msg)}`;
						}
						commands[perm.command].push(txt);
					});
					/* eslint-disable guard-for-in */
					for (const cmd in commands) {
						fields.push({
							inline: true,
							name: cmd,
							value: commands[cmd].join('\n'),
						});
					}
					msg.say({
						embed: {
							title: 'Permissions set up in ' + msg.guild.name,
							fields: fields,
							color: msg.guild.me.displayColor || 16743889,
							description: fields.length === 0 ? 'No permissions are configured.' : undefined,
						},
					});
				});
			}
		}
	}
};

function fancyTarget(target, targetType, msg) {
	switch (targetType) {
		case 'user':
			return `<@${target}>`;
		case 'role':
			return `role **${msg.guild.roles.get(target).name}**`;
		case 'channel':
			return `<#${target}>`;
		case 'guild':
			return `guild`;
	}
}
