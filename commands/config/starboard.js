const {Command} = require('discord.js-commando');
const starboard = require('../../utils/models/starboard.js');
const channelType = new (require('discord.js-commando/src/types/channel.js'))(this);
const integerType = new (require('discord.js-commando/src/types/integer.js'))(this);

module.exports = class StarboardCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'starboard',
			group: 'config',
			memberName: 'starboard',
			aliases: ['sb'],
			description: 'Starboard posts messages with a certain number of ⭐ reactions to a channel. Use this command to set it up.',
			details: 'Set the required number of ⭐ reactions: `starboard threshold <number>`.\n'
			+'View the current threshold using `starboard threshold`.\n'
			+'Use `starboard channel <channel>` to specify the channel where starboard posts should be sent.\n'
			+'To enable or disable starboard, use `starboard enable` and `starboard disable`.',
			examples: ['starboard threshold 5', 'starboard channel #coolmessages', 'starboard enable'],
			format: '<action> [limit or channel]',
			guildOnly: true,
			args: [
				{
					key: 'action',
					prompt: 'Please specify one of: threshold, channele, enable, disable.',
					type: 'string',
					validate: (val, msg, currArg, prevArgs) => {
						return ['limit', 'threshold', 'channel', 'enable', 'disable'].includes(val);
					},
				}, {
					key: 'limitorchannel',
					prompt: 'What is the threshold?',
					type: 'string',
					default: '',
					validate: (val, msg, currArg, prevArgs) => {
						let validated = false;
						switch (prevArgs.action) {
							case 'limit':
							case 'threshold':
								if (val === '') return true;
								if (!parseInt(val) || parseInt(val) <= 0) {
									currArg.reprompt = 'Please enter a number above 0.';
									return false;
								}
								return true;
							case 'channel':
								validated = channelType.validate(val, msg);
								if (typeof validated === 'string' && validated.indexOf('Multiple channels found') === 0) {
									currArg.reprompt = validated;
									return false;
								}
								return validated;
						}
						return false;
					},
					parse: (value, msg, currArg, prevArgs) => {
						switch (prevArgs.action) {
							case 'channel':
								return channelType.parse(value, msg.message);
							case 'limit':
							case 'threshold':
								return value === '' ? '' : integerType.parse(value, msg.message);
						}
					},
				},
			],
		});
	}

	hasPermission(msg) {
		if (this.client.isOwner(msg.author)) return true;
		if (msg.member.hasPermission('MANAGE_MESSAGES')) return true;
		return 'You need permission to manage messages in order to manage donor colors.';
	}

	async run(msg, args) {
		const px = msg.guild.commandPrefix;
		switch (args.action) {
			case 'limit':
			case 'threshold':
				if (args.limitorchannel === '') return msg.say('The threshold is ' + starboard.getLimit(msg));
				if (args.limitorchannel > 2147483647) return msg.say('do you think you\'re funny')
				starboard.setLimit(msg, args.limitorchannel);
				msg.say(`Starboard threshold set to ${args.limitorchannel}.` + (starboard.getChannel(msg) ? starboard.isEnabled(msg) ? '' : '\n*Starboard is disabled, use `' + px + 'starboard enable`*' : '\n*Please set a channel using `' + px + 'starboard channel ...`*'));
				break;
			case 'channel':
				starboard.setChannel(msg, args.limitorchannel);
				msg.say(`Starboard channel set to <#${args.limitorchannel.id}>.` + (starboard.getLimit(msg) ? starboard.isEnabled(msg) ? '' : '\n*Starboard is disabled, use `' + px + 'starboard enable`*' : '\n*Please set a threshold using `' + px + 'starboard threshold ...`*'));
				break;
			case 'enable':
				starboard.enable(msg);
				msg.say('Starboard is now enabled.');
				break;
			case 'disable':
				starboard.disable(msg);
				msg.say('Starboard is now disabled.');
		}
	}
};
