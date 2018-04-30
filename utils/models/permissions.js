const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Database = require('../../database.js');

const db = Database.db;

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
		});
	},

	getList: async function(msg) {
		return permissionCache[msg.guild.id] || [];
	},

	showPermissions: async function(msg, command) {
		return permissionCache[msg.guild.id].filter(p => {
			return p.command === command;
		});
	},

	findPermissions: async function(options) {
		return permissionCache[options.guild].find((perm) => {
			/* eslint-disable guard-for-in */
			for (const opt in options) {
				if (perm[opt] !== options[opt]) return false;
			}
			return true;
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
				console.log('REEEEEEEEEE ', permissionCache[msg.guild.id]);
				console.log('SETTT', settings);
				const cached = permissionCache[msg.guild.id].find((perm) => {
					/* eslint-disable guard-for-in */
					for (const opt in settings) {
						if (perm[opt] !== settings[opt] && opt !== 'allow' && !(opt === 'target' && settings.targetType === 'guild')) return false;
					}
					return true;
				});
				for (const opt in settings) {
					cached[opt] = settings[opt];
				}
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
				permissionCache[msg.guild.id].push({
					guild: msg.guild.id,
					targetType: settings.targetType || 'guild',
					target: settings.target || 'guild',
					command: settings.command,
					allow: settings.allow,
				});
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

	clearPermission: async function(msg, settings) {
		for (let i = permissionCache[msg.guild.id].length - 1; i >= 0; i--) {
			if (permissionCache[msg.guild.id][i].command === settings.command) permissionCache[msg.guild.id].splice(i, 1);
		}
		permissions.destroy({
			where: {
				guild: msg.guild.id,
				command: settings.command,
			},
		});
	},

	defaultPermission: async function(msg, settings) {
		permissionCache[msg.guild.id].splice(permissionCache[msg.guild.id].findIndex((perm) => {
			for (const opt in settings) {
				if (perm[opt] !== settings[opt] && opt !== 'allow') return false;
			}
			return true;
		}), 1);
		const where = {
			guild: msg.guild.id,
			targetType: settings.targetType,
			command: settings.command,
		};
		if (settings.targetType !== 'guild') where.target = settings.target;
		permissions.destroy({
			where: where,
		});
	},

	hasPermission: async function(command, msg) {
		const perms = permissionCache[msg.guild.id].filter((p) => {
			return (p.command === command.name || p.command === 'group:' + command.group.id || p.command === '*');
		});
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
	},
};
