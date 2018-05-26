const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const Database = require('../../database.js');

const db = Database.db;

const starposts = db.define('starposts', {
	guild: {
		/* eslint-disable-next-line */
		type: Sequelize.STRING(25),
	},
	message: { // 'guild', 'channel', 'role', 'user'
		/* eslint-disable-next-line */
		type: Sequelize.STRING(25),
	},
	starpost: {
		/* eslint-disable-next-line */
		type: Sequelize.STRING(25),
	},
}, { timestamps: false, charset: 'utf8mb4' });

const starguilds = db.define('starguilds', {
	guild: {
		/* eslint-disable-next-line */
		type: Sequelize.STRING(25),
		unique: true,
	},
	limit: {
		type: Sequelize.INTEGER,
	},
	channel: {
		/* eslint-disable-next-line */
		type: Sequelize.STRING(25),
	},
});

db.sync();

const starboardCache = {};
const starguildCache = {};

module.exports = {
	buildStarboardCache: async function(guildList) {
		guildList.forEach(id => {
			starboardCache[id] = [];
		});
		starguilds.findAll({
			where: {
				guild: {[Op.in]: guildList},
			},
		}).then(x => {
			x = x.map(f => f.dataValues);
			x.forEach(p => {
				starguildCache[p.guild] = {limit: p.limit, channel: p.channel};
			});
		});
		console.log(starguildCache);
		return starposts.findAll({
			where: {
				guild: {[Op.in]: guildList},
			},
		}).then(x => {
			x = x.map(f => f.dataValues);
			let count = 0;
			x.forEach(p => {
				count++;
				starboardCache[p.guild].push({message: p.message, starpost: p.starpost});
			});
			return count;
		});
	},

	addStarpost: async function(msg, starpost) {
		starboardCache[msg.guild.id].push({message: msg.id, starpost: starpost});
		return starposts.upsert({
			guild: msg.guild.id,
			message: msg.id,
			starpost: starpost,
		});
	},

	isStarpost: function(msg) {
		return starboardCache[msg.guild.id].find(m => m.message === msg.id);
	},

	setLimit: async function(msg, limit) {
		starguildCache[msg.guild.id] = starguildCache[msg.guild.id] || {};
		starguildCache[msg.guild.id].limit = limit;
		return starguilds.upsert({
			guild: msg.guild.id,
			limit: limit,
		});
	},

	getLimit: function(msg) {
		return starguildCache[msg.guild.id].limit || 9000;
	},

	getChannel: function(msg) {
		return starguildCache[msg.guild.id].channel;
	},

	setChannel: function(msg, channel) {
		starguildCache[msg.guild.id] = starguildCache[msg.guild.id] || {};
		starguildCache[msg.guild.id].channel = channel.id;
		return starguilds.upsert({
			guild: msg.guild.id,
			channel: channel.id,
		});
	},

	getStarpost: function(msg) {
		return starboardCache[msg.guild.id].find(m => m.message === msg.id).starpost;
	},
};
