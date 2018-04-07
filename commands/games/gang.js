const {Command} = require('discord.js-commando');
const gangs = require('../../utils/models/gangs.js');
const crypto = require('crypto');

const killMessages = [
	'You stab the gang leader, disbanding the gang and its **{}** members.',
	'You shoot everyone, disbanding the gang and its **{}** members.',
	'You give the gang members the wrong meeting location, confusing them and disbanding the **{}** member gang.',
	'You bomb the meeting spot, forcing the **{}** member gang to disband.',
	'You call the police on the gang, getting all **{}** members arrested.',
	'The gang disbands for some reason, but all **{}** members blame you.',
	'You tell the mods, who ban all **{}** members of the gang.',
];

function generateKillMessage(killed, name) {
	return `${killMessages[Math.floor(Math.random() * killMessages.length)].replace('{}', killed)}\n\nYou've **betrayed** the gang, and they are no more.`;
}

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'gang',
			group: 'games',
			memberName: 'gang',
			description: 'Command to manage gangs, type "help gang" for all gang subcommands',
			details: '',
			examples: ['', ''],
			format: '[subcommand] [options]',
			guildOnly: true,
			args: [
				{
					key: 'subcommand',
					prompt: 'this is a prompt haha lmao',
					type: 'string',
					default: 'view',
					parse: s => s.toLowerCase(),
				},
				{
					key: 'opts',
					prompt: 'dont tell anyone but i love the golden pepe',
					type: 'string',
					default: '',
				},
			],
		});
	}

	async run(msg, {subcommand, opt}) {
		/* eslint-disable indent*/
		switch (subcommand) {
			case 'new': case 'create': case 'make':
				return gangs.newGang(msg, opt).then(() => msg.say(
					`Your gang **${opt}** has been created!\n\nUse \`!gang code\` to see your invite code, or \`!gang help\` for how to customize your gang.`
				)).catch(() => msg.say('You\'re already in a gang, or you already own one.'));

			case 'join':
				return gangs.joinGang(msg, opt).then((gangInstance) => msg.say(`You joined **${gangInstance.dataValues.gangName}**! Use \`!gang\` to see its profile.`)
					.then(() => {
						msg.delete().catch(() => msg.say('**Be sure to delete your message with the code!!**'));
				}))
					.catch(e => {
						if (e.message == 'Invalid code') return msg.say('There is no gang by that code.');
						if (e.message == 'In or owns gang') return msg.say('You\'re already in a gang!');
					});
			case 'leave':
				return gangs.leaveGang(msg).then(destroyed => msg.say(destroyed ? 'You\'ve left the gang peacefully.' : 'You\'re not part of a gang.'));
			case 'betray': case 'shootout': case 'end': case 'kill': case 'nuke':
				return gangs.destroyGang(msg).then(destroyed => msg.say(destroyed ? generateKillMessage() : 'You\'re not part of a gang.'));
			case 'code': case 'password': case 'secret':
				return this.code(msg, opt);
			case 'name': case 'title':
			case 'desc': case 'description': case 'bio': case 'phrase': case 'motto': case 'info':
			case 'color': case 'colour':
			case 'pic': case 'picture': case 'image': case 'img':
		}
		/* eslint-enable */
	}

	async newGang(msg, opt) {
		if (opt.toLowerCase() == 'new') {
			gangs.findGangByOwner(msg.author.id).then(gang => {
				gang.gangCode = crypto.createHash('whirlpool').update(`${new Date().getTime()}${msg.author.id}`).digest('hex').slice(0, 10);
				gangs.updateGang(msg, gang);
				return msg.author.send(`**Code changed!**\nHere is the active secret code to your gang, be careful who you give it to...\nUse\`gang code new\` to delete this code and generate a new one.`).then(() => msg.author.send(`\`${gang.gangCode}\``));
			});
		}
		return gangs.findGangByOwner(msg.author.id).then(gang => {
			if (!gang) return msg.say('You don\'t own a gang.');
			if (gang) return msg.author.send(`Here is the active secret code to your gang, be careful who you give it to...\nUse\`gang code new\` to delete this code and generate a new one.`).then(() => msg.author.send(`\`${gang.gangCode}\``));
		});
	}
};
