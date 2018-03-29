const {Command} = require('discord.js-commando');
const request = require('request-promise');
const unescape = require('unescape');
const unidecode = require('unidecode');
function decode(str) {
	return unidecode(unescape(str))
		.replace(/&#039;/g, '\'')
		.replace(/&Uuml;/gi, 'u')
		.replace(/&rsquo;/gi, '"')
		.replace(/&eacute;/gi, 'e')
		.replace(/<i>|<\/i>/gi, '')
		.replace(/\\'/gi, `'`)
		.replace(/"/gi, '');
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
		return request({uri: `http://jservice.io/api/random?count=100`, json: true})
			.then((data) => {
				let questions = data.map((q) => ({question: decode(q.question), answer: decode(q.answer), category: decode(q.category.title)}));
				questions = questions.filter((e) => !(/which of|who of/gi.test(e.question)));
				this.game(msg, maxPoints, {}, 0, `The score limit is ${maxPoints}.`, questions, 0);
			}).catch((e) => {
				msg.guild.triviaRunning = false;
				msg.say('I couldn\'t start a game of trivia right now. If this persists, please report the bug with the !support command.');
			});
	}

	async game(msg, maxPoints, score, angerCount, append, questions, totalQuestions) {
		if (angerCount >= 3) {
			msg.guild.triviaRunning = false;
			return msg.say('Inactivity, game ending.');
		}
		for (let player in score) {
			if (score[player] >= maxPoints) {
				msg.guild.triviaRunning = false;
				return msg.say(`${msg.guild.members.get(player).displayName} has reached ${maxPoints} points and won!`);
			}
		}
		let currQuestion = questions.splice(0, 1)[0];
		if (!currQuestion) {
			try {
				await request({uri: `http://jservice.io/api/random?count=100`, json: true})
					.then((data) => {
						questions = data.map((q) => ({question: decode(q.question), answer: decode(q.answer), category: decode(q.category.title)}));
						questions = questions.filter((e) => !e.question.match(/which of|who of/i));
					});
				currQuestion = questions.splice(0, 1)[0];
			} catch (e) {
				msg.guild.triviaRunning = false;
				return msg.say('Something went wrong, and I have run out of questions.');
			}
		}
		totalQuestions += 1;
		const embed = {
			title: currQuestion.category,
			fields: [
				{
					name: 'Question:',
					value: currQuestion.question,
				},
				{
					name: 'Hint:',
					value: currQuestion.answer.split('').map((l, i) => {
						if (l == ' ' || /[^a-zA-Z]/.test(l)) return l;
						if (i == 0 || i == 1) return '-';
						if (Math.floor(Math.random() * 3) == 0) return `${l}`;
						return '-';
					}).join(''),
				},
			],
			color: 5072583,
			footer: {text: angerCount == 2 ? 'If nobody speaks soon, the game will end!' : '"aeiou stop" - ends game, "aeiou next" - skip'},
		};
		msg.say(`${append}\n\nType the correct answer to earn a point.`, { embed }).catch(() => {
			this.game(msg, maxPoints, score, angerCount, `I made a mistake and had to skip a question. Call me names.`, questions, totalQuestions);
		});
		const collector = msg.channel.createMessageCollector((m) => m.author.id != this.client.user.id && m.channel.id == msg.channel.id, {time: 30000});
		collector.on('collect', (collected) => {
			angerCount = 0;
			if (collected.cleanContent.toLowerCase() === currQuestion.answer.toLowerCase()) {
				score[collected.author.id] = score[collected.author.id] + 1 || 1;
				collector.stop('correct');
				return this.game(msg, maxPoints, score, angerCount, `${collected.member.displayName} guessed correctly and now has ${score[collected.author.id]} points! The answer was \`${currQuestion.answer}\`.`, questions, totalQuestions);
			}
			if (['aeiou stop', 'aeiou skip', 'shut up', 'shut the fuck up', 'shut the hell up', 'shut the heck up'].includes(collected.cleanContent.toLowerCase())) {
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
			return this.game(msg, maxPoints, score, angerCount + 1, `Nobody guessed the word. The answer was: \`${currQuestion.answer}\``, questions, totalQuestions);
		});
	}
};
