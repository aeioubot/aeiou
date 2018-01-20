const {Command} = require('discord.js-commando');
const donorDB = require('../../utils/models/donor.js');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'dcolor',
			group: 'donor',
			memberName: 'dcolor',
			description: 'Allows a donator to set their color.',
			details: 'Allows a donator to set their color using Hex (#FFFFFF) or RGB (255, 255, 255) format.',
			examples: ['dcolor #FFFFFF', 'dcolor 255, 255, 255', '255 255 255'],
			format: '[hex or rgb color]',
			guildOnly: true,
			args: [
				{
					key: 'color',
					prompt: 'What color would you like to make your role?',
					type: 'string',
					format: '[hex or rgb color]',
				},
			],
		});
	}
	validateType(str) {
		str = str.replace(',', '');
		if (str.substring(0, 1) === '#' && str.length === 7) return 'hex';
		if (str.split(' ').length === 1 && (parseInt(str, 16) <= 0xFFFFFF)) return 'hex';
		const allBelow255 = str.split().every((number) => {
			return parseInt(number, 10) <= 255;
		});
		if (str.split(' ').length === 3 && allBelow255) return 'rgb';
		return null;
	}

	rgbToHex(rgb) {
		let hex = Number(rgb).toString(16);
		if (hex.length < 2) {
			hex = `0${hex}`;
		}
		return hex;
	}

	async run(msg, args) {
		let {color} = args;
		const donors = await donorDB.getDonors(msg)
		const donor = donors.find(donor => donor.id === msg.author.id);
		if (!donor) return msg.say('You don\'t have a donor color on this server!');
		const type = this.validateType(color);
		if (!type) return msg.say('Your color was invalid, please use RGB or hex format.');
		if (type === 'rgb') {
			let thisColor = color.replace(/[^0-9\s]/g, '').split(' ');
			thisColor = thisColor.map(number => this.rgbToHex(number));
			thisColor = `#${thisColor.join('')}`;
			msg.guild.roles.find('id', donor.role).setColor(thisColor);
			return msg.say('Your role color has been changed.');
		}
		if (type === 'hex') {
			if (color.substring(0, 1) !== '#') color = `#${color}`;
			msg.guild.roles.find('id', donor.role).setColor(color);
			return msg.say('Your role color has been changed.');
		}
	}
};
