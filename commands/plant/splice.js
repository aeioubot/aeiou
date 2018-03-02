const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');
const commonWords = require('../../utils/commonWords.js');

function shuffle(array) {
	let currentIndex = array.length;
	let temporaryValue;
	let randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
};

function determineSymbol(number) {
	if (number === 0) return '~';
	if (number >= 0) return ['+', '++', '++', '+++', '++++', '++++'][number-1] || '+++++';
	number = Math.abs(number);
	if (number <= 3) return '-';
	if (number <= 8) return '--';
	if (number <= 14) return '---';
	if (number <= 20) return '----';
	return '-----';
}

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'splice',
			group: 'plant',
			memberName: 'splice',
			description: 'Splices the 2 seeds together, giving you a chance to create a better seed.',
			details: 'Starts a splice between 2 seeds. After initialising a splice, you must unscramble the word, doing this properly will yield you 1 improved seed, depending on how fast you unscramble. Failing to do so will kill your seed.',
			examples: ['splice 3 5', 'splice 1 9'],
			guildOnly: true,
			args: [
				{
					key: 'seedOne',
					label: 'seed number',
					prompt: 'Which seed would you like to splice?',
					type: 'integer',
				},
				{
					key: 'seedTwo',
					label: 'seed number',
					prompt: 'Which seed would you like to splice with?',
					type: 'integer',
				},
			],
		});
	}

	async run(msg, {seedOne, seedTwo}) {
		const userPlant = await plants.getPlant(msg);
		if (seedOne == seedTwo || !userPlant.seedExists(seedOne).success || !userPlant.seedExists(seedTwo).success) return msg.say('You provided invalid seed numbers. Please try again.');
		const firstSeedObject = userPlant.getPlantData().seeds[seedOne];
		const secondSeedObject = userPlant.getPlantData().seeds[seedTwo];
		const randomWord = commonWords.randomWord();
		let randomScrambleSegment = randomWord.split('').splice(1, randomWord.length-2);
		shuffle(randomScrambleSegment);
		randomScrambleSegment.unshift(randomWord.charAt(0) + '-');
		randomScrambleSegment.push('-' + randomWord.charAt(randomWord.length-1));

		msg.say(`Unscramble this word within 30 seconds to properly splice your seeds. The first and last letters are in their place.\n\`${randomScrambleSegment.join('')}\``);
		const collector = msg.channel.createMessageCollector((m) => m.cleanContent.toLowerCase() == randomWord, {time: 30000, maxMatches: 1});
		collector.on('end', (collected) => {
			if (!collected.first()) {
				const newSeed = {
					name: `Miserably failed splice `,
				};
				const embed = {
					title: `Splice of "${firstSeedObject.name}" and "${secondSeedObject.name}"`,
					description: `Compared to the first, this is how your stats have changed.`,
					color: 4353864,
					thumbnail: {
						url: 'https://i.imgur.com/ADn4piz.png',
					},
					footer: {
						text: 'NOTE: Splicing drastically unequal seeds will result in a terrible splice.',
					},
					fields: [],
				};
				Object.keys(firstSeedObject).forEach((key, i) => {
					if (key == 'name') return;
					if (key == 'red' || key == 'green' || key == 'blue') {
						return newSeed[key] = Math.floor((firstSeedObject[key] + secondSeedObject[key]) / 2);
					}
					newSeed[key] = Math.ceil(((firstSeedObject[key] + secondSeedObject[key]) + Math.log(51 - Math.max(firstSeedObject[key], secondSeedObject[key]) / 2) / 0.3) / 3);
					embed.fields.push({
						name: key,
						value: determineSymbol(newSeed[key] - firstSeedObject[key]),
						inline: true,
					});
				});
				userPlant.removeFromSeeds(Math.max(seedOne, seedTwo));
				userPlant.removeFromSeeds(Math.min(seedOne, seedTwo));
				userPlant.addToSeeds(newSeed);
				userPlant.addToSeeds(newSeed);
				return plants.storePlant(userPlant).then(msg.say('Your splice went miserably, and you try to recover what you can.', { embed }));
			}
			// ============
			const newSeed = {
				name: `Successful splice `,
			};
			const embed = {
				title: `Splice of "${firstSeedObject.name}" and "${secondSeedObject.name}"`,
				description: `Compared to the first, this is how your stats have changed.`,
				color: 4353864,
				thumbnail: {
					url: 'https://i.imgur.com/ADn4piz.png',
				},
				footer: {
					text: 'NOTE: Splicing drastically unequal seeds will result in a terrible splice.',
				},
				fields: [],
			};
			Object.keys(firstSeedObject).forEach((key, i) => {
				if (key == 'name') return;
				if (key == 'red' || key == 'green' || key == 'blue') {
					return newSeed[key] = Math.floor((firstSeedObject[key] + secondSeedObject[key]) / 2);
				}
				newSeed[key] = Math.ceil(((firstSeedObject[key] + secondSeedObject[key]) + Math.log(51 - Math.max(firstSeedObject[key], secondSeedObject[key]) / 2) / 0.3) / 2);
				embed.fields.push({
					name: key,
					value: determineSymbol(newSeed[key] - firstSeedObject[key]),
					inline: true,
				});
			});
			userPlant.removeFromSeeds(Math.max(seedOne, seedTwo));
			userPlant.removeFromSeeds(Math.min(seedOne, seedTwo));
			userPlant.addToSeeds(newSeed);
			plants.storePlant(userPlant).then(msg.say('Well done!', { embed }));
		});
	}
};
