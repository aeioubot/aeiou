const {Command} = require('discord.js-commando');
const gangs = require('../../utils/models/gangs.js');
const crypto = require('crypto');
const { stripIndent } = require('common-tags');

const killMessages = [
	'You stab the gang leader, disbanding the gang and its **{}** members.',
	'You shoot everyone, disbanding the gang and its **{}** members.',
	'You give the gang members the wrong meeting location, confusing them and disbanding the **{}** member gang.',
	'You bomb the meeting spot, forcing the **{}** member gang to disband.',
	'You call the police on the gang, getting all **{}** members arrested.',
	'You tell the mods, who ban all **{}** members of the gang.',
];

function generateKillMessage(killed, name) {
	return `${killMessages[Math.floor(Math.random() * killMessages.length)].replace('{}', killed)}\n\nYou've **betrayed** the gang, and they are no more.`;
}

module.exports = class GangCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'gang',
			group: 'games',
			aliases: ['gangs', 'sphere', 'spheres'],
			memberName: 'gang',
			description: 'Command to manage gangs, type "help gang" for all gang subcommands',
			details: stripIndent`
			**Remember that all commands work in DMs so you can stay hidden.**
			\`new\`: Creates a gang. Include the name as the option.
			\`join\`: Joins a gang by the provided code.
			\`leave\`: Leaves a gang without destroying it.
			\`betray\`: **Destroys a gang** that you are in, betraying all of its members.
			\`code\`: [Gang owner only] Sends the join code of the gang you own. Use \`gang code new\` to generate a new one.
			\`name\`: Changes the name of the gang you own.
			\`desc\`: Changes the description of the gang you own.
			\`color\`: Changes the color of the gang you own.
			\`pic\`: Changes the picture of the gang you own. You can provide a URL or upload an image.
			\`view\`: Shows the gang you are a part of.
			\`card\`: Shows your total and largest betrays.
			`,
			format: '[subcommand] [options]',
			guildOnly: false,
			args: [
				{
					key: 'subcommand',
					prompt: 'this is a prompt haha lmao',
					type: 'string',
					default: 'view',
					parse: s => s.toLowerCase(),
				},
				{
					key: 'opt',
					prompt: 'dont tell anyone but i love the golden pepe',
					type: 'string',
					default: '',
				},
			],
		});
	}

	async run(msg, { subcommand, opt }) {
		/* eslint-disable indent*/
		switch (subcommand) {
			case 'new': case 'create': case 'make':
				if (opt.length < 1) return msg.say(`You must specify your gang name. Use the format \`${msg.guild ? msg.guild.commandPrefix : ''}gang new [name]\``);
				if (opt.length > 256) return msg.say('Your name must be fewer than 256 characters.');
				return gangs.newGang(msg, opt).then(() => msg.say(
					`Your gang **${opt}** has been created!\n\nUse \`${msg.guild ? msg.guild.commandPrefix : ''}gang code\` to see your invite code, or \`${msg.guild ? msg.guild.commandPrefix : ''}gang help\` for how to customize your gang.`
				)).catch(() => msg.say('You\'re already in a gang, or you already own one.'));

			case 'join':
				return gangs.joinGang(msg, opt).then((gangInstance) => msg.say(`You joined a gang! Use \`${msg.guild ? msg.guild.commandPrefix : ''}gang\` to see its profile.`)
					.then(() => {
						msg.delete().catch(() => msg.say('**Be sure to delete your message with the code!!**'));
				}))
					.catch(e => {
						if (e.message == 'Invalid code') return msg.say('There is no gang by that code.');
						if (e.message == 'In or owns gang') return msg.say('You\'re already in a gang!');
						console.log(e);
						return msg.say('Something unexpected happened.');
					});

			case 'leave':
				return gangs.leaveGang(msg).then(destroyed => msg.say(destroyed ? 'You\'ve left the gang peacefully.' : 'You\'re not part of a gang.'))
					.catch(e => {
						if (e.message == 'Owns gang') return msg.say('You cannot leave a gang you own!');
						if (e.message == 'Not in gang') return msg.say('You cannot leave a gang if you are not in one!');
						console.log(e);
						return msg.say('Something unexpected happened.');
					});

			case 'betray': case 'shootout': case 'end': case 'kill': case 'nuke':
				return gangs.destroyGang(msg).then(destroyed => msg.say(destroyed ? generateKillMessage(destroyed) : 'You\'re not part of a gang.'))
					.then(() => msg.say('**Delete** your message if you want to stay hidden.').then(m => m.delete(3000)));

			case 'code': case 'password': case 'secret':
				return this.code(msg, opt);

			case 'name': case 'title':
				if (opt.length > 256) return msg.say('Your name must be fewer than 256 characters.');
				return gangs.findGangByOwner(msg.author.id).then(gang => {
					if (!gang || !gang.parentUser) return msg.say('You aren\'t part of a gang!');
					if (gang.parentUser != gang.user) return msg.say('You cannot edit a gang you don\'t own!');
					gang.gangName = opt;
					return gangs.updateGang(msg, gang).then(() => {
						return msg.say('Your gang has been edited.');
					});
				});

			case 'desc': case 'description': case 'bio': case 'phrase': case 'motto':
				return gangs.findGangByOwner(msg.author.id).then(gang => {
					if (!gang || !gang.parentUser) return msg.say('You aren\'t part of a gang!');
					if (gang.parentUser != gang.user) return msg.say('You cannot edit a gang you don\'t own!');
					gang.gangDescription = opt;
					return gangs.updateGang(msg, gang).then(() => {
						return msg.say('Your gang has been edited.');
					});
				});
			case 'color': case 'colour':
				return gangs.findGangByOwner(msg.author.id).then(gang => {
					if (!gang || !gang.parentUser) return msg.say('You aren\'t part of a gang!');
					if (gang.parentUser != gang.user) return msg.say('You cannot edit a gang you don\'t own!');
					gang.gangColor = parseInt(opt, 16);
					if (!gang.gangColor && gang.gangColor != 0) return msg.say('The colour you provided was invalid. Please use hex format, and don\'t include the #.');
					return gangs.updateGang(msg, gang).then(() => {
						return msg.say('Your gang has been edited.');
					});
				});

			case 'pic': case 'picture': case 'image': case 'img':
				if (msg.attachments.first() && msg.attachments.first().height) {
					return gangs.findGangByOwner(msg.author.id).then(gang => {
						if (!gang || !gang.parentUser) return msg.say('You aren\'t part of a gang!');
						if (gang.parentUser != gang.user) return msg.say('You cannot edit a gang you don\'t own!');
						gang.gangImage = msg.attachments.first().url;
						return gangs.updateGang(msg, gang).then(() => {
							return msg.say('Your gang has been edited.');
						});
					});
				}
				if (!/^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(opt)) return msg.say('That isn\'t a valid URL.');
				return gangs.findGangByOwner(msg.author.id).then(gang => {
					if (!gang || !gang.parentUser) return msg.say('You aren\'t part of a gang!');
					if (gang.parentUser != gang.user) return msg.say('You cannot edit a gang you don\'t own!');
					gang.gangImage = opt;
					return gangs.updateGang(msg, gang).then(() => {
						return msg.say('Your gang has been edited.');
					});
				});

			case 'view': case 'show': case 'status': case 'info':
				return this.view(msg);
			case 'card':
				return this.card(msg);
		}
		/* eslint-enable indent*/
		return msg.say('That was an invalid subcommand, type \'!help gang\' to see all subcommands.');
	}

	async code(msg, opt) {
		if (opt.toLowerCase() == 'new') {
			return gangs.findGangByOwner(msg.author.id).then(gang => {
				if (!gang || !gang.parentUser) return msg.say('You don\'t own a gang.');
				gang.gangCode = crypto.createHash('whirlpool').update(`${new Date().getTime()}${msg.author.id}`).digest('hex').slice(0, 10);
				gangs.updateGang(msg, gang);
				return msg.author.send(`**Code changed!**\nHere is the active secret code to your gang, be careful who you give it to...\nUse \`gang code new\` to delete this code and generate a new one.`).then(() => msg.author.send(`\`${gang.gangCode}\``))
					.catch(() => msg.say('I couldn\'t DM you your code, do you have me blocked?'));
			});
		}
		return gangs.findGangByOwner(msg.author.id).then(gang => {
			if (!gang || !gang.parentUser) return msg.say('You don\'t own a gang.');
			return msg.author.send(`Here is the active secret code to your gang, be careful who you give it to...\nUse\`gang code new\` to delete this code and generate a new one.`).then(() => msg.author.send(`\`${gang.gangCode}\``))
				.catch(() => msg.say('I couldn\'t DM you your code, do you have me blocked?'));
		});
	}

	async card(msg) {
		return gangs.getUserRow(msg).then(d => {
			msg.say('Here is your betrayal card.', {
				embed: {
					title: `${msg.author.username}'s betrayal card`,
					color: 0xffa500,
					thumbnail: {
						url: msg.author.displayAvatarURL ? msg.author.displayAvatarURL : 'https://cdn.drawception.com/images/panels/2017/10-22/RwwgkkS5qQ-10.png',
					},
					fields: [
						{
							name: 'Total betrays',
							value: d.totalBetrays,
							inline: true,
						},
						{
							name: 'Biggest betray',
							value: d.biggestBetrayCount,
							inline: true,
						},
					],
				},
			});
		});
	}

	async view(msg) {
		return gangs.findGangByUser(msg).then(async d => {
			if (!d || !d.parentUser) return msg.say('You\'re not part of a gang.');
			return msg.say('Here is the gang you\'re a part of.', {
				embed: {
					title: d.gangName,
					description: d.gangDescription,
					color: d.gangColor,
					image: {
						url: d.gangImage,
					},
					fields: [
						{
							name: 'Members',
							value: await gangs.getMemberCount(d.parentUser),
							inline: true,
						},
						{
							name: 'Owner',
							value: msg.guild && msg.guild.members.get(d.parentUser) ? msg.guild.members.get(d.parentUser).displayName : d.parentUser,
							inline: true,
						},
					],
				},
			}).catch(async e => {
				return msg.say('Here is the gang you\'re a part of.', {
					embed: {
						title: d.gangName,
						description: d.gangDescription,
						color: d.gangColor,
						fields: [
							{
								name: 'Members',
								value: await gangs.getMemberCount(d.parentUser),
								inline: true,
							},
							{
								name: 'Owner',
								value: msg.guild && msg.guild.members.get(d.parentUser) ? msg.guild.members.get(d.parentUser).displayName : d.parentUser,
								inline: true,
							},
						],
					},
				});
			});
		});
	}
};
