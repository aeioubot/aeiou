const {Command} = require('discord.js-commando');
const request = require('request-promise');
const unescape = require('unescape');
const unidecode = require('unidecode');
function decode(str) {
	return unidecode(unescape(str)).replace('&#039;', '\'');
}

module.exports = class TriviaCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'trivia',
			group: 'games',
			memberName: 'trivia',
			aliases: ['tv', 'triv'],
			description: 'Starts a game of trivia.',
			details: 'Starts a game of trivia.',
			examples: ['trivia 3', 'trivia 11'],
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

	async run(msg, {maxPoints}) {
		if (msg.guild.triviaRunning) return msg.say('Trivia is already running on this server!');
		try {
			await msg.say('Starting game...');
		} catch (e) {
			return;
		}
		msg.guild.triviaRunning = true;
		return request({uri: `https://opentdb.com/api.php?amount=${maxPoints * 20}&type=multiple`, json: true})
			.then((data) => {
				if (data.response_code !== 0) throw new Error('opentdb response error');
				this.questions = data.results.map((q) => ({question: decode(q.question), answer: decode(q.correct_answer)}));
				this.totalQuestions = 0;
				this.game(msg, maxPoints, {}, 0);
			}).catch(() => msg.say('I couldn\'t start a game of trivia right now. If this persists, please report the bug with the !support command.'));
	}

	async game(msg, maxPoints, score, angerCount) {
		if (angerCount >= 3) {
			msg.guild.triviaRunning = false;
			return msg.say('Inactivity, game ending.');
		}
		for (let player in score) {
			if (score[player] >= maxPoints) {
				msg.guild.triviaRunning = false;
				return msg.say(`${msg.guild.members.get(player).displayName} has reached ${maxPoints} points and won!\n`);
			}
		}
		const question = this.questions.splice(0, 1)[0];
		this.totalQuestions += 1;
		const embed = {
			title: `Question #${this.totalQuestions}!`,
			fields: [
				{
					name: question.question,
					value: question.answer.split('').map((l, i) => {
						if (i == 0 || i == 1) return '-';
						if (l == ' ' || /[^a-zA-Z]/.test(l)) return l;
						if (Math.floor(Math.random() * 3) == 0) return `${l}`;
						return '-';
					}).join(''),
				},
			],
			color: 5072583,
			footer: {text: angerCount == 2 ? 'If nobody speaks soon, the game will end!' : 'Type "aeiou stop" to end the game, and "aeiou next" to skip.'},
		};
		msg.say('Type the correct answer to earn a point.', { embed });
		const collector = msg.channel.createMessageCollector((m) => m.author.id != this.client.user.id && m.channel.id == msg.channel.id, {time: 30000});
		collector.on('collect', (collected) => {
			angerCount = 0;
			if (collected.cleanContent.toLowerCase() === question.answer.toLowerCase()) {
				score[collected.author.id] = score[collected.author.id] + 1 || 1;
				if (score[collected.author.id] < maxPoints) msg.say(`${collected.member.displayName} guessed correctly and now has ${score[collected.author.id]} points! The answer was \`${question.answer}\`.`);
				collector.stop('correct');
				return this.game(msg, maxPoints, score, angerCount);
			}
			if (['aeiou stop', 'shut up', 'shut the fuck up', 'shut the hell up', 'shut the heck up'].includes(collected.cleanContent.toLowerCase())) {
				msg.guild.triviaRunning = false;
				collector.stop('shutUp');
				return msg.say('Game ended.');
			}
			if (collected.cleanContent.toLowerCase() == 'aeiou next') {
				collector.stop();
			}
		});
		collector.on('end', (collected, reason) => {
			if (reason == 'shutUp' || reason == 'correct') return;
			msg.say('Nobody guessed the word. The answer was: ' + question.answer);
			return this.game(msg, maxPoints, score, angerCount + 1);
		});
	}
};
