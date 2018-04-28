const Sequelize = require('sequelize');
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

module.exports = {
	getList: async function(msg) {
		return permissions.findAll({
			where: {
				guild: msg.guild.id,
			},
		}).then((r) => {
			return [...new Set(r.map(perm => perm.dataValues.command))];
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

	clearPermission: async function(msg, settings) {
		permissions.destroy({
			where: {
				guild: msg.guild.id,
				targetType: settings.targetType,
				target: settings.target,
				command: settings.command,
			},
		});
	},

	hasPermission: async function(command, msg) {
		return permissions.findAll({
			where: {
				command: command,
				guild: msg.guild.id,
			},
		}).then((r) => {
			const perms = r.map((p) => p.dataValues);
			for (let i = 0; i < perms.length; i++) {
				const perm = perms[i];
				if (perm.targetType === 'user') {
					if (perm.target == msg.author.id) {
						// msg.say((perm.allow ? 'ALLOW' : 'DENY') + ' for USER');
						return perm.allow;
					}
				}
			};
			for (let i = 0; i < perms.length; i++) {
				const perm = perms[i];
				if (perm.targetType === 'role') {
					if ([...msg.member.roles.keys()].indexOf(perm.target) > -1) {
						// msg.say((perm.allow ? 'ALLOW' : 'DENY') + ' for ROLE');
						return perm.allow;
					}
				}
			};
			for (let i = 0; i < perms.length; i++) {
				const perm = perms[i];
				if (perm.targetType === 'channel') {
					if (perm.target == msg.channel.id) {
						// msg.say((perm.allow ? 'ALLOW' : 'DENY') + ' for CHANNEL');
						return perm.allow;
					}
				}
			};
			for (let i = 0; i < perms.length; i++) {
				const perm = perms[i];
				if (perm.targetType === 'guild') {
					// msg.say((perm.allow ? 'ALLOW' : 'DENY') + ' for GUILD');
					return perm.allow;
				}
			};
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
/*
	getUserRow: async function (msg) {
		return gangs.findOrCreate({
			where: {
				user: msg.author.id,
			},
		}).then((returnedData) => {
			return returnedData[0].dataValues;
		});
	},

	findGangByUser: async function (msg) {
		return gangs.findOne({
			where: {
				[Op.or]: [{ user: msg.author.id }, { parentUser: msg.author.id }],
			},
		}).then((returnedData) => {
			if (!returnedData) return returnedData;
			if (returnedData.dataValues.parentUser && returnedData.dataValues.parentUser != returnedData.dataValues.user) return this.findGangByOwner(returnedData.dataValues.parentUser);
			return returnedData.dataValues;
		});
	},

	findGangByOwner: async function (id) {
		return gangs.findOne({
			where: {
				user: id,
			},
		}).then((returnedData) => {
			try {
				return returnedData.dataValues;
			} catch (e) {
				return null;
			}
		});
	},

	updateGang: async function (msg, gang) {
		return gangs.update(gang, { where: { user: msg.author.id } });
	},

	getMemberCount: async function (parentID) {
		return (await gangs.findAll({ where: { parentUser: parentID } })).length;
	},

	joinGang: async function (msg, code) {
		return Promise.all([
			this.findGangByCode(code),
			this.findGangByUser(msg),
		]).then(tf => {
			if (!tf[0]) throw new Error('Invalid code'); // [gang owner entry, user's gang]
			if (tf[1] && tf[1].parentUser) throw new Error('In or owns gang');
			return gangs.upsert({
				user: msg.author.id,
				parentUser: tf[0].user,
				gangName: tf[0].gangName,
				gangCode: tf[0].gangCode,
			});
		});
	},

	destroyGang: async function (msg) {
		return this.findGangByUser(msg).then(gang => {
			if (!gang) throw new Error('Gang does not exist');
			return gangs.update({
				parentUser: null,
				gangCode: null,
				gangName: null,
				gangDescription: null,
				gangColor: null,
				gangImage: null,
				gangMembers: null,
			}, { where: { parentUser: gang.parentUser } }).then(d => {
				if (d[0] > 1) {
					gangs.findOne({ where: { user: msg.author.id } }).then(entry => entry.update({
						biggestBetrayCount: Math.max((d[0] - 1), entry.dataValues.biggestBetrayCount),
						totalBetrays: entry.dataValues.totalBetrays + (d[0] - 1),
					}));
				};
				return d[0];
			});
		});
	},

	leaveGang: async function (msg) {
		const t = await this.getUserRow(msg);
		if (!t || !t.parentUser) throw new Error('Not in gang');
		if (t.user == t.parentUser) throw new Error('Owns gang');
		return gangs.update({
			parentUser: null,
			gangCode: null,
			gangDescription: null,
			gangColor: null,
			gangImage: null,
			gangMembers: null,
		}, { where: { user: msg.author.id } });
	},*/
};
