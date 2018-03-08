const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');

function componentToHex(c) {
	let hex = c.toString(16);
	return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(r, g, b) {
	return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const statWords = [
	'Terrible',
	'Bad',
	'Not that terrible',
	'Passable',
	'Normal',
	'Better than normal',
	'Above average',
	'Good',
	'Very good',
	'Great',
	'Excellent',
	'Ascended',
];

const translations = {
	growthRate: 'Growth rate',
	leafiness: 'Leafiness',
	sleepChance: 'Chance of sleeping',
	waterAffinity: 'Water affinity',
	red: 'Red',
	green: 'Green',
	blue: 'Blue',
};

module.exports = class SeedsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'seeds',
			aliases: ['seed', 'stats'],
			group: 'plant',
			memberName: 'seeds',
			description: 'The command to play with all your seeds.',
			details: 'The command to view and interact with all your seeds.',
			examples: ['!seeds', '!seeds view 9'],
			format: '[option] [arguments]',
			guildOnly: true,
			args: [
				{
					key: 'seedNumber',
					prompt: 'woot wat wot Wyllt',
					type: 'integer',
					default: '',
				},
			],
		});
	}

	async run(msg, {seedNumber}) {
		const plantClass = await plants.getPlant(msg);
		if (seedNumber !== 0 && !seedNumber) {
			let textContent = ['The seeds you own are:', '```json'];
			plantClass.getPlantData().seeds.forEach((seed, index) => {
				textContent.push(`[${index}]  ${seed.name}`);
			});
			if (textContent.length == 2) return msg.say('You don\'t have any seeds in your pouch. Try using `!dig` to find one.');
			textContent.push('```');
			return msg.say(textContent.join('\n'));
		}
		const requested = plantClass.getPlantData().seeds[seedNumber];
		if (!requested) return msg.say('That wasn\'t a valid seed number.');
		const embed = {
			author: {
				name: requested.name,
				icon_url: 'https://images.emojiterra.com/twitter/512px/1f330.png',
			},
			color: parseInt(rgbToHex(requested.red, requested.green, requested.blue), 16),
			fields: [],
		};
		const seedFields = Object.keys(requested);
		seedFields.splice(seedFields.indexOf('name'), 1);
		seedFields.map((fieldName) => {
			embed.fields.push({
				name: translations[fieldName],
				value: (fieldName == 'red' || fieldName == 'green' || fieldName == 'blue') ? requested[fieldName] : statWords[Math.round((requested[fieldName] * statWords.length-1) / 100)],
				inline: true,
			});
		});
		msg.say('', {embed});
	}
};
