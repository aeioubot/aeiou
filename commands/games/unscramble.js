const {Command} = require('discord.js-commando');
const permissions = require('../../utils/models/permissions.js');
const {randomWord} = require('../../utils/commonWords.js');

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

module.exports = class UnscrambleCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'unscramble',
			group: 'games',
			memberName: 'unscramble',
			aliases: ['unscromble', 'unscronch'],
			description: 'Starts a game of unscramble.',
			details: 'Starts a game of unscramble.',
			examples: ['unscramble 3', 'unscramble 200'],
			format: '[max points]',
			guildOnly: true,
			args: [
				{
					key: 'maxPoints',
					label: 'maximum points',
					prompt: 'dnfiouaspnfininidbusbdau haha lmao frog',
					type: 'integer',
					default: 10,
					min: 1,
					max: 100,
				},
			],
		});
	}

	hasPermission(msg) {
		if (!msg.guild.me.hasPermission('EMBED_LINKS')) return 'I need permission to embed links in order to play unscramble.';
		return true;
	}

	async run(msg, { maxPoints }) {

		if (msg.guild.unscrambleRunning) return msg.say('Unscramble is already running on this server!');
		try {
			await msg.say('Starting game...');
		} catch (e) {
			return;
		}
		msg.guild.unscrambleRunning = true;
		this.game(msg, maxPoints, {}, 0);
	}

	async game(msg, maxPoints, score, angerCount) {
		if (angerCount >= 3) {
			msg.guild.unscrambleRunning = false;
			return msg.say('Inactivity, game ending.');
		}
		for (let player in score) {
			if (score[player] >= maxPoints) {
				msg.guild.unscrambleRunning = false;
				return msg.say(`${msg.guild.members.get(player).displayName} has reached ${maxPoints} points and won!\n`);
			}
		}
		const answer = randomWord();
		const scrambled = shuffle(answer.split('').splice(1, answer.length-2));
		scrambled.unshift(answer.charAt(0) + '-');
		scrambled.push('-' + answer.charAt(answer.length-1));
		const embed = {
			title: 'Unscramble',
			description: scrambled.join(''),
			color: 5072583,
			footer: {text: angerCount == 2 ? 'If nobody speaks soon, the game will end!' : '"aeiou stop" - ends game, "aeiou next" - skip'},
		};
		msg.say('Unscramble the word to earn a point.', { embed });
		const collector = msg.channel.createMessageCollector((m) => m.author.id != this.client.user.id && m.channel.id == msg.channel.id, {time: 30000});
		collector.on('collect', (collected) => {
			angerCount = 0;
			if (['exit', 'stop', 'aeiou stop', 'shut up', 'shut the fuck up', 'shut the hell up', 'shut the heck up'].includes(collected.cleanContent.toLowerCase())) {
				msg.guild.unscrambleRunning = false;
				collector.stop('shutUp');
				return msg.say('Game ended.');
			}
			if (collected.cleanContent.toLowerCase() === answer) {
				score[collected.author.id] = score[collected.author.id] + 1 || 1;
				if (score[collected.author.id] < maxPoints) msg.say(`${collected.member.displayName} guessed correctly and now has ${score[collected.author.id]} points! The word was ${answer}.`);
				collector.stop('correct');
				return this.game(msg, maxPoints, score, angerCount);
			}
			if (collected.cleanContent.toLowerCase() == 'aeiou next') {
				collector.stop();
			}
		});
		collector.on('end', (collected, reason) => {
			if (reason == 'shutUp' || reason == 'correct') return;
			msg.say('Nobody guessed the word. The answer was: ' + answer);
			angerCount += 1;
			return this.game(msg, maxPoints, score, angerCount);
		});
	}
};
