const {Command} = require('discord.js-commando');
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

	async run(msg, {maxPoints}) {
		if (msg.guild.unscrambleRunning) return msg.say('Unscramble is already running on this server!');
		msg.guild.unscrambleRunning = true;
		this.score = {};
		this.angerCount = 0;
		this.game(msg, maxPoints, this.score);
	}

	async game(msg, maxPoints, score, angerTest) {
		if (this.angerCount >= 3) {
			msg.guild.unscrambleRunning = false;
			return msg.say('Inactivity, game ending.');
		}
		for (let player in score) {
			if (score[player] >= maxPoints) {
				msg.guild.unscrambleRunning = false;
				if (angerTest) angerTest.end();
				return msg.say(`${msg.guild.members.get(player).displayName} has reached ${maxPoints} points and won!\n`);
				msg.guild.unscrambleRunning = false;
			}
		}
		const answer = randomWord();
		const scrambled = shuffle(answer.split('').splice(1, answer.length-2));
		scrambled.unshift(answer.charAt(0) + '-');
		scrambled.push('-' + answer.charAt(answer.length-1));
		const embed = {
			title: 'Unscramble',
			description: scrambled.join(''),
			color: 16429195,
			footer: {text: this.angerCount == 2 ? 'If nobody speaks soon, the game will end!' : ''},
		};
		msg.say('Unscramble the word to earn a point.', { embed });
		const collector = msg.channel.createMessageCollector((m) => m.cleanContent.toLowerCase() === answer, {time: 30000, maxMatches: 1});
		angerTest = msg.channel.createMessageCollector((m) => m.author.id != this.client.user.id && m.channel.id == msg.channel.id, {time: 30000});
		angerTest.on('collect', (m) => {
			if (['exit', 'stop', 'shut up', 'shut the fuck up', 'shut the hell up', 'shut the heck up'].includes(m.cleanContent.toLowerCase())) {
				msg.guild.unscrambleRunning = false;
				collector.stop('shutUp');
				angerTest.stop();
				return msg.say('Game ended.');
			}
			this.angerCount = 0;
		});
		collector.on('end', (collected, reason) => {
			if (reason == 'shutUp') return;
			if (!collected.first()) {
				msg.say('Nobody guessed the word. The answer was: ' + answer);
				this.angerCount += 1;
				return this.game(msg, maxPoints, score, angerTest);
			}
			const answerMessage = collected.first();
			score[answerMessage.author.id] = score[answerMessage.author.id] + 1 || 1;
			if (score[answerMessage.author.id] < maxPoints) msg.say(`${answerMessage.member.displayName} guessed correctly and now has ${score[answerMessage.author.id]} points! The word was ${answer}.`);
			return this.game(msg, maxPoints, score);
		});
	}
};
