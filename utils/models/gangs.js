const Sequelize = require('sequelize');
const Database = require('../../database.js');
const crypto = require('crypto');
const Op = Sequelize.Op;

const db = Database.db;

const gangs = db.define('gangs', {
	user: {
		/* eslint-disable-next-line */
		type: Sequelize.STRING(25),
		unique: true,
	},
	parentUser: {
		type: Sequelize.STRING,
	},
	gangCode: {
		/* eslint-disable-next-line */
		type: Sequelize.TEXT,
	},
	gangName: {
		type: Sequelize.TEXT,
	},
	gangDescription: {
		type: Sequelize.TEXT,
		defaultValue: 'This gang doesn\'t have a description.',
	},
	gangColor: {
		type: Sequelize.STRING,
		defaultValue: '0',
	},
	gangImage: {
		type: Sequelize.TEXT,
	},
	biggestBetrayCount: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
	totalBetrays: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
}, {timestamps: false, charset: 'utf8mb4'});

module.exports = {
	newGang: async function(msg, name) {
		if ((await this.findGangByUser(msg)) && (await this.findGangByUser(msg)).parentUser) throw new Error('In or owns gang');
		return gangs.upsert({
			user: msg.author.id,
			parentUser: msg.author.id,
			gangCode: crypto.createHash('whirlpool').update(`${new Date().getTime()}${msg.author.id}`).digest('hex').slice(0, 10),
			gangName: name,
			gangDescription: 'This gang has no description yet.',
			gangImage: '',
			gangMembers: '[]',
		});
	},

	findGangByCode: async function(code) {
		return gangs.findAll({
			where: {
				gangCode: code.toLowerCase(),
			},
		}).then((r) => {
			return r.find(i => i.dataValues.user == i.dataValues.parentUser);
		});
	},

	getUserRow: async function(msg) {
		return gangs.findOrCreate({
			where: {
				user: msg.author.id,
			},
		}).then((returnedData) => {
			return returnedData[0].dataValues;
		});
	},

	findGangByUser: async function(msg) {
		return gangs.findOne({
			where: {
				[Op.or]: [{user: msg.author.id}, {parentUser: msg.author.id}],
			},
		}).then((returnedData) => {
			if (!returnedData) return returnedData;
			if (returnedData.dataValues.parentUser && returnedData.dataValues.parentUser != returnedData.dataValues.user) return this.findGangByOwner(returnedData.dataValues.parentUser);
			return returnedData.dataValues;
		});
	},

	findGangByOwner: async function(id) {
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

	updateGang: async function(msg, gang) {
		return gangs.update(gang, {where: {user: msg.author.id}});
	},

	getMemberCount: async function(parentID) {
		return (await gangs.findAll({where: {parentUser: parentID}})).length;
	},

	joinGang: async function(msg, code) {
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

	destroyGang: async function(msg) {
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
			}, {where: {parentUser: gang.parentUser}}).then(d => {
				if (d[0] > 1) {
					gangs.findOne({where: {user: msg.author.id}}).then(entry => entry.update({
						biggestBetrayCount: Math.max((d[0] - 1), entry.dataValues.biggestBetrayCount),
						totalBetrays: entry.dataValues.totalBetrays + (d[0] - 1),
					}));
				};
				return d[0];
			});
		});
	},

	leaveGang: async function(msg) {
		const t = await this.findGangByOwner(msg.author.id);
		if (t.user = t.parentUser) throw new Error('Owns gang');
		return gangs.upsert({
			parentUser: null,
			gangCode: null,
			gangDescription: null,
			gangColor: null,
			gangImage: null,
			gangMembers: null,
		}, {where: {user: msg.user.id}});
	},
};
