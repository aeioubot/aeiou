const Sequelize = require('sequelize');
const Database = require('../../database.js');
const crypto = require('crypto');

const db = Database.db;

const gangs = db.define('gangs', {
	user: {
		type: Sequelize.STRING,
		unique: true,
	},
	parentUser: {
		type: Sequelize.STRING,
	},
	gangCode: {
		// eslint-disable-next-line
		type: Sequelize.TEXT,
		unique: true,
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
		defaultValue: 'FFFFFF',
	},
	gangImage: {
		type: Sequelize.TEXT,
	},
	gangMembers: {
		type: Sequelize.TEXT,
	},
	biggestBetrayCount: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
	biggestBetrayName: {
		type: Sequelize.TEXT,
	},
	totalBetrays: {
		type: Sequelize.INTEGER,
		defaultValue: 0,
	},
}, {timestamps: false, charset: 'utf8mb4'});

module.exports = {
	newGang: async function(msg, name) {
		if (await this.findGangByUser(msg)) throw new Error('In or owns gang');
		return gangs.create({
			user: msg.author.id,
			parentUser: null,
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
		});
	},

	findGangByUser: async function(msg) {
		return gangs.findOne({
			where: {
				$or: [
					{user: msg.author.id},
					{parentUser: msg.author.id},
				],
			},
		}).then((returnedData) => {
			if (!returnedData) return returnedData;
			if (returnedData.dataValues.parentUser) return this.findGangByOwner(returnedData.dataValues.parentUser);
			if (!returnedData.dataValues.parentUser) return returnedData.dataValues;
		});
	},

	findGangByOwner: async function(id) {
		return gangs.findOne({
			where: {
				user: id,
			},
		}).then((returnedData) => {
			try {
				return returnedData[0].dataValues;
			} catch (e) {
				return null;
			}
		});
	},

	updateGang: async function(msg, gang) {
		return gangs.update(gang, {where: {user: msg.author.id}});
	},

	joinGang: async function(msg, code) {
		return Promise.all([
			this.findGangByCode(code),
			this.findGangByUser(msg),
		]).then(tf => {
			if (!tf[0]) throw new Error('Invalid code');
			if (tf[1]) throw new Error('In or owns gang');
			return gangs.create({
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
				gangDescription: null,
				gangColor: null,
				gangImage: null,
				gangMembers: null,
			}, {where: {gangCode: gang.gangCode}}).then(d => {
				if (d[0] > 1) {
					gangs.findOne({where: {user: msg.author.id}}).then(entry => entry.update({
						biggestBetrayCount: Math.max(d[0], entry.dataValues.biggestBetrayCount),
						biggestBetrayName: d[0] > entry.dataValues.biggestBetrayCount ? d[1].dataValues.biggestBetrayName : entry.dataValues.biggestBetrayName,
						totalBetrays: entry.dataValues.totalBetrays + (d[0] - 1),
					}));
				};
				return d[0];
			});
		});
	},

	leaveGang: async function(msg) {
		return gangs.destroy({where: {user: msg.author.id}});
	},
};
