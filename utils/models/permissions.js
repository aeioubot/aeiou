const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Database = require('../../database.js');

const db = Database.db;

function test1(cmd) {
	if (cmd === '*') return 2;
	if (cmd.indexOf('group:') === 0) return 1;
	return 0;
}

const permissions = db.define('permissions', {
	guild: {
		/* eslint-disable-next-line */
		type: Sequelize.STRING(25),
	},
	targetType: { // 'guild', 'channel', 'role', 'user'
		/* eslint-disable-next-line */
		type: Sequelize.STRING(25),
	},
	target: { // 'guild', channelID, roleID, userID
		/* eslint-disable-next-line */
		type: Sequelize.STRING(25),
	},
	command: {
		/* eslint-disable-next-line */
		type: Sequelize.STRING(50),
	},
	allow: {
		type: Sequelize.BOOLEAN,
	},
}, { timestamps: false, charset: 'utf8mb4' });

const permissionCache = {};
/*
{
	guildID: [
		perm,
		perm,
	]
}
*/

module.exports = {
	buildPermissionCache: async function(guildList) {
		guildList.forEach(id => {
			permissionCache[id] = [];
		});
		return permissions.findAll({
			where: {
				guild: {[Op.in]: guildList},
			},
		}).then(x => {
			x = x.map(f => f.dataValues);
			x.forEach(p => {
				permissionCache[p.guild].push(p);
			});
			console.log(permissionCache);
		});
	},

	getList: async function(msg) {
		return permissionCache[msg.guild.id] || [];
		return permissions.findAll({
			where: {
				guild: msg.guild.id,
			},
		}).then((r) => {
			return r.map(perm => perm.dataValues);
		});
	},

	findPermissions: async function(options) {
		return permissionCache[options.guild].find((perm) => {
			/* eslint-disable guard-for-in */
			for (let opt in options) {
				if (perm[opt] !== options[opt]) return false;
			}
			return true;
		})
		return permissions.find({
			where: options,
		});
	},

	setPermission: async function(msg, settings) {
		permissions.find({
			where: {
				guild: msg.guild.id,
				targetType: settings.targetType || 'guild',
				target: settings.target || 'guild',
				command: settings.command,
			},
		}).then((r) => {
			if (r) { // Permission exists --> update
				permissions.update({
					allow: settings.allow,
				}, {
					where: {
						guild: msg.guild.id,
						targetType: settings.targetType || 'guild',
						target: settings.target || 'guild',
						command: settings.command,
					},
				});
			} else {
				permissions.upsert({
					guild: msg.guild.id,
					targetType: settings.targetType || 'guild',
					target: settings.target || 'guild',
					command: settings.command,
					allow: settings.allow,
				});
			}
		});
	},

	clearPermission: async function (msg, settings) {
		permissions.destroy({
			where: {
				guild: msg.guild.id,
				command: settings.command,
			},
		});
	},

	defaultPermission: async function (msg, settings) {
		permissions.destroy({
			where: {
				guild: msg.guild.id,
				targetType: settings.targetType,
				target: settings.target,
				command: settings.command,
			},
		});
	},

	hasPermission: async function (command, msg) {
		return permissions.findAll({
			where: {
				[Op.or]: [{
					command: command.name,
				}, {
					command: 'group:' + command.group.id,
				}, {
					command: '*',
				}],
				guild: msg.guild.id,
			},
		}).then((r) => {
			const perms = r.map((p) => p.dataValues);
			const orderOfImportance = ['user', 'role', 'channel', 'guild'];
			perms.sort((a, b) => {
				return orderOfImportance.indexOf(a.targetType) - orderOfImportance.indexOf(b.targetType);
			});
			const permTypes = [
				perms.filter(p => p.command !== '*' && p.command.indexOf('group:') === -1),
				perms.filter(p => p.command.indexOf('group:') === 0),
				perms.filter(p => p.command === '*'),
			];
			for (let permTypeIndex = 0; permTypeIndex < permTypes.length; permTypeIndex++) {
				const arr = permTypes[permTypeIndex];
				for (let i = 0; i < arr.length; i++) {
					const perm = arr[i];
					switch (perm.targetType) {
						case 'user':
							if (perm.target == msg.author.id) {
								return perm.allow;
							}
							break;
						case 'role':
							if ([...msg.member.roles.keys()].indexOf(perm.target) > -1) {
								return perm.allow;
							}
							break;
						case 'channel':
							if (perm.targetType === 'channel') {
								if (perm.target == msg.channel.id) {
									if (perm.command === '*' && !perm.allow && msg.command.name !== 'ignore') return 'IGNORED';
									if (msg.command.name !== 'ignore') return perm.allow;
								}
							}
							break;
						case 'guild':
							return perm.allow;
					}
				}
			}
			return true;
		});
	},

	showPermissions: async function(msg, command) {
		return permissions.findAll({
			where: {
				command: command,
				guild: msg.guild.id,
			},
		}).then((r) => {
			const perms = r.map((p) => p.dataValues);
			return perms;
		});
	},
};
