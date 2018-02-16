const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');
const commonWords = require('../../utils/commonWords.js');

function shuffle(array) {
	let currentIndex = array.length, temporaryValue, randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
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

		const timer = await msg.say(`The splicing has begun, unscramble this word to properly splice your seeds. The first and last letters are in their place.\n\`${randomScrambleSegment.join('')}\``);
		const collector = msg.channel.createMessageCollector((m) => m.cleanContent.toLowerCase() == randomWord, {time: 30000, maxMatches: 1});
		collector.on('end', (collected) => {
			if (!collected.first()) {
				msg.say('the word was: ' + randomWord);
			}
			return msg.say('crr');
		});
	}
};
