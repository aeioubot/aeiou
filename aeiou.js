const secure = require('./secure.json');
const Commando = require('discord.js-commando');
const Discord = require('discord.js');
const path = require('path');
const SequelizeProvider = require('./utils/Sequelize');
const messageListeners = require('./utils/messageListeners.js');
const database = require('./database.js');
const donors = require('./utils/models/donor.js');
const reacts = require('./utils/models/creact.js');
const starboard = require('./utils/models/starboard.js');
const memwatch = require('memwatch-next');
const permissions = require('./utils/models/permissions');
const GatewayCommand = require('./utils/classes/GatewayCommand.js');
const DBL = require('dblapi.js');
const BFD = require('bfd-api');
const rp = require('request-promise');

const dbl = secure.dblToken ? new DBL(secure.dblToken) : undefined;
const botsfordiscord = secure.botsfordiscordToken ? new BFD(secure.botsfordiscordToken) : undefined;

const Aeiou = new Commando.Client({
	owner: ['147604925612818432', '94155927032176640'],
	commandPrefix: secure.prefix,
	unknownCommandResponse: false,
	disableEveryone: true,
	messageCacheMaxSize: 50,
	disabledEvents: ['TYPING_START'],
});

database.start(Aeiou.shard.id);

Aeiou.setProvider(new SequelizeProvider(database.db)).catch(console.error);
Aeiou.gateway = new (require('./utils/Gateway/Gateway.js'))(Aeiou);

Aeiou.registry
	.registerGroups([
		['fun', 'Fun commands'],
		['search', 'Search commands'],
		['cr', 'Custom reactions'],
		['games', 'Game commands'],
		['config', 'Config commands'],
		['mod', 'Mod commands'],
		['plant', 'Plant commands'],
		['misc', 'Miscellaneous commands'],
		['role', 'Role commands'],
		['tag', 'Tag commands'],
		['owner', 'Owner commands'],
		['starboard', 'starry commands'],
	])
	.registerDefaultTypes()
	.registerDefaultGroups()
	.registerDefaultCommands({
		ping: false,
		reload: false,
		prefix: false,
	})
	.registerCommandsIn(path.join(__dirname, 'commands'));

Aeiou.on('ready', () => {
	reacts.buildReactCache(Array.from(Aeiou.guilds.keys()), Aeiou.shard.id).then(c => {
		console.log(`[Shard ${Aeiou.shard.id}] Cached ${c} reactions for ${Array.from(Aeiou.guilds.keys()).length} guilds!`);
	});
	starboard.buildStarboardCache(Array.from(Aeiou.guilds.keys()), Aeiou.shard.id).then(c => {
		console.log(`[Shard ${Aeiou.shard.id}] Cached ${c} starposts for ${Array.from(Aeiou.guilds.keys()).length} guilds!`);
	});
	permissions.buildPermissionCache([...Aeiou.guilds.keys()]);
	memwatch.on('leak', (info) => {
		info.time = new Date().toLocaleString();
		info.shard = Aeiou.shard.id;
		console.log(info);
	});
	if (Aeiou.shard.id == 0) Aeiou.dmManager = new (require('./utils/classes/DmManager.js'))(Aeiou);
	console.log(`[Shard ${Aeiou.shard.id}] ＡＥＩＯＵ-${Aeiou.shard.id} Ready to be used and abused!`);
	if (secure.dblToken) {
		dbl.postStats(Aeiou.guilds.size, Aeiou.shard.id, Aeiou.shard.count);
		setInterval(() => {
			dbl.postStats(Aeiou.guilds.size, Aeiou.shard.id, Aeiou.shard.count);
		}, 15 * 60 * 1000); // 15 minutes
	}
	if (secure.botsfordiscordToken && Aeiou.shard.id === 0) {
		setTimeout(postBFDstats, 1 * 60 * 1000); // set initially after 1 min, when shards have all started
		setInterval(postBFDstats, 15 * 60 * 1000); // 15 minutes
	}
	if (secure.botsdiscordpwToken) {
		postBDPstats();
		setInterval(postBDPstats, 15 * 60 * 1000); // 15 minutes
	}
});

const events = {
	MESSAGE_REACTION_ADD: 'messageReactionAdd',
	MESSAGE_REACTION_REMOVE: 'messageReactionRemove',
};

Aeiou.on('raw', async event => {
	if (!events.hasOwnProperty(event.t)) return;

	const { d: data } = event;
	if (data.emoji.name !== '⭐') return;

	const user = Aeiou.users.get(data.user_id);
	const channel = Aeiou.channels.get(data.channel_id) || await user.createDM();

	if (channel.messages.has(data.message_id)) return;

	const message = await channel.fetchMessage(data.message_id);

	const reaction = message.reactions.get(data.emoji.name) || {count: 0, emoji: {name: '⭐', id: null, animated: false}, message: message};

	Aeiou.emit(events[event.t], reaction, user);
});


// Starboard
Aeiou.on('messageReactionAdd', (reaction, user) => {
	if (reaction.emoji.name !== '⭐') return;

	if (starboard.getLimit(reaction.message) > reaction.count) return;

	if (starboard.isStarpost(reaction.message)) return;

	const channelID = starboard.getChannel(reaction.message);

	if (starboard.isStarposted(reaction.message)) {
		return reaction.message.guild.channels.get(channelID).fetchMessage(starboard.getStarpost(reaction.message)).then(msg => {
			msg.edit({embed: createStarboardEmbed(reaction.message, reaction.count)});
		});
	};

	reaction.message.guild.channels.get(channelID).send({embed: createStarboardEmbed(reaction.message, reaction.count)}).then(msg => {
		starboard.addStarpost(reaction.message, msg.id);
	});
});

Aeiou.on('messageReactionRemove', (reaction, user) => {
	if (reaction.emoji.name !== '⭐') return;

	if (starboard.isStarpost(reaction.message)) return;

	if (!starboard.isStarposted(reaction.message)) return;

	const channelID = starboard.getChannel(reaction.message);
	reaction.message.guild.channels.get(channelID).fetchMessage(starboard.getStarpost(reaction.message)).then(msg => {
		msg.edit({embed: createStarboardEmbed(reaction.message, reaction.count)});
	});
});

function createStarboardEmbed(msg, count) {
	const embed = new Discord.RichEmbed({
		author: {
			name: msg.author.username + ' in #' + msg.channel.name,
			icon_url: msg.author.avatarURL,
		},
		description: msg.content,
		footer: {
			icon_url: 'https://images-ext-1.discordapp.net/external/3wBJyAlmIpF1rveHgNaFa_wNFgK7LdwypIpNMcAa7Y8/https/emojipedia-us.s3.amazonaws.com/thumbs/120/twitter/103/white-medium-star_2b50.png',
			text: count + ' · posted at ' + msg.createdAt.toISOString().replace('T', ' ').replace(/:\d\d\.\d\d\dZ/, ' UTC'),
		},
	});
	if (msg.attachments.size) {
		const att = msg.attachments.first();
		const imgtypes = ['jpg', 'jpeg', 'png', 'gif'];
		if (att.filename.includes('.') && imgtypes.includes(att.filename.slice(att.filename.lastIndexOf('.') + 1, att.filename.length))) {
			embed.setImage(att.url);
		} else {
			embed.addField('Attachments', msg.attachments.first().url);
		}
	} else if (msg.embeds.length) {
		const msgEmbed = msg.embeds[0];
		switch (msgEmbed.type) {
			case 'image':
			case 'gifv':
				embed.setImage(msgEmbed.url);
				break;
			case 'link':
				embed.setTitle(msgEmbed.title);
				embed.setURL(msgEmbed.url);
				embed.setThumbnail(msgEmbed.thumbnail.url);
				break;
			case 'rich':
				if (msgEmbed.title) embed.setTitle(msgEmbed.title);
				if (msgEmbed.description) embed.addField('Embed', msgEmbed.description);
				/* eslint-disable guard-for-in */
				for (const fieldIndex in msgEmbed.fields) {
					const field = msgEmbed.fields[fieldIndex];
					embed.addField(field.name, field.value, field.inline);
				}
				if (msgEmbed.thumbnail) embed.setThumbnail(msgEmbed.thumbnail.url);
				if (msgEmbed.image) embed.setImage(msgEmbed.image.url);
				break;
			case 'video':
				embed.setTitle(msgEmbed.title);
		}
	}
	return embed;
}

Aeiou.dispatcher.addInhibitor(async msg => {
	if (!msg.command) return false;
	if (['ignore', 'crignore', 'permission'].includes(msg.command.name)) return false;
	if (Aeiou.isOwner(msg.author.id)) return false;
	if (msg.channel.type == 'dm') return false;
	if (msg.command.name === 'creact' && /\s+list/.test(msg.argString)) return false; // The permission check will be done inside the cr command.
	return permissions.hasPermission(msg.command, msg).then(r => {
		if (r === 'IGNORED') return true;
		if (!r) {
			msg.react('🙅');
			return true;
		}
		return !r;
	});
});

process.on('message', (response) => {
	Aeiou.gateway.processMessage(response);
});

Aeiou.on('message', async (msg) => {
	messageListeners.creact(msg);
	messageListeners.plantSeed(msg);
	if (!msg.author.bot && !msg.content && msg.channel.type == 'dm') Aeiou.dmManager.newMessage(msg);
});

Aeiou.on('unknownCommand', (msg) => {
	if (!msg.author.bot && msg.channel.type == 'dm') Aeiou.dmManager.newMessage(msg);
});

Aeiou.on('guildMemberAdd', (member) => {
	donors.getDonors(member).then((donors) => {
		const possibleDonor = donors.find((donorObject) => member.id === donorObject.id);
		if (possibleDonor) {
			member.addRole(member.guild.roles.get(possibleDonor.role)).catch(() => {/* nothing because there's nothing to respond to, and its not an important error. */});
		}
	});
});

Aeiou.on('guildCreate', async (guild) => {
	const totalGuilds = await Aeiou.gateway.sendMessage(new GatewayCommand(
		Aeiou.shard.count,
		Aeiou.shard.id,
		'shardStats',
		[],
	)).then((data) => {
		let totalGuilds = 0;
		data.forEach((d, ind) => {
			totalGuilds += d.totalGuilds;
		});
		return totalGuilds;
	});

	Aeiou.gateway.sendMessage(new GatewayCommand(
		Aeiou.shard.count,
		Aeiou.shard.id,
		'messageServer',
		[],
		{
			guild: '338414417006034947',
			channel: '440263369656762379',
			msg: '',
			opts: {
				embed: {
					title: 'Server joined.',
					color: 0x42f459,
					thumbnail: {
						url: guild.iconURL,
					},
					fields: [
						{
							name: 'Name',
							value: guild.name,
							inline: true,
						},
						{
							name: 'Owner',
							value: guild.owner.user.tag,
							inline: true,
						},
						{
							name: 'Members',
							value: guild.memberCount,
						},
					],
					footer: {
						text: 'Total guilds: ' + totalGuilds,
					},
				},
			},
		}
	));
});

Aeiou.on('guildDelete', async (guild) => {
	const totalGuilds = await Aeiou.gateway.sendMessage(new GatewayCommand(
		Aeiou.shard.count,
		Aeiou.shard.id,
		'shardStats',
		[],
	)).then((data) => {
		let totalGuilds = 0;
		data.forEach((d, ind) => {
			totalGuilds += d.totalGuilds;
		});
		return totalGuilds;
	});

	Aeiou.gateway.sendMessage(new GatewayCommand(
		Aeiou.shard.count,
		Aeiou.shard.id,
		'messageServer',
		[],
		{
			guild: '338414417006034947',
			channel: '440263369656762379',
			msg: '',
			opts: {
				embed: {
					title: 'Server left. :(',
					color: 0xf71621,
					thumbnail: {
						url: guild.iconURL,
					},
					fields: [
						{
							name: 'Name',
							value: guild.name,
							inline: true,
						},
						{
							name: 'Owner',
							value: guild.owner.user.tag,
							inline: true,
						},
						{
							name: 'Members',
							value: guild.memberCount,
						},
					],
					footer: {
						text: 'Total guilds: ' + totalGuilds,
					},
				},
			},
		}
	));
});

Aeiou.login(secure.token);

function postBFDstats() {
	Aeiou.gateway.sendMessage(new GatewayCommand(Aeiou.shard.count, Aeiou.shard.id, 'shardStats', [])).then((data) => {
		let totalGuilds = 0;
		data.forEach((d, ind) => {
			totalGuilds += d.totalGuilds;
		});
		botsfordiscord.postCount(totalGuilds, Aeiou.user.id);
	});
}

function postBDPstats() {
	rp({
		method: 'POST',
		uri: 'https://bots.discord.pw/api/bots/' + Aeiou.user.id + '/stats',
		body: {
			shard_id: Aeiou.shard.id,
			shard_count: Aeiou.shard.count,
			server_count: Aeiou.guilds.size,
		},
		headers: {
			Authorization: secure.botsdiscordpwToken,
		},
		json: true,
	});
}
