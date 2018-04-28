const {Command} = require('discord.js-commando');
const request = require('request-promise');

module.exports = class AskCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ask',
			group: 'search',
			memberName: 'ask',
			description: 'Grabs a random question from Ask Reddit.',
			details: 'Grabs a random question from Ask Reddit.',
			guildOnly: false,
		});
	}

	async run(msg, args) {
		if (!this.questions || !this.questions.length) {
			setTimeout(() => this.questions = [], 21600000); // Delete old questions after 6 hours
			return request('http://www.reddit.com/r/askReddit/hot/.json?count=25', {json: true}).then((questions) => { // Cache 100 questions;
				this.questions = questions.data.children.filter((e) => !e.data.stickied && !e.data.over_18);
				return questions.data.before;
			}).then(async t => {
				await msg.say(
					this.questions.splice(Math.floor(Math.random() * this.questions.length), 1)[0].data.title
						.replace(/redditors/gi, 'Discord users')
						.replace(/subreddit/gi, 'server')
						.replace(/reddit/gi, 'Discord')
						.replace(/\[serious\]/gi, '')
				);
				return t;
			}).then((t) => {
				return request(`http://www.reddit.com/r/askReddit/hot/.json?count=25&after=${t}`, {json: true}).then((questions) => {
					this.questions = this.questions.concat(questions.data.children.filter((e) => !e.data.stickied && !e.data.over_18));
					return questions.data.before;
				});
			}).then((t) => {
				return request(`http://www.reddit.com/r/askReddit/hot/.json?count=25&after=${t}`, {json: true}).then((questions) => {
					this.questions = this.questions.concat(questions.data.children.filter((e) => !e.data.stickied && !e.data.over_18));
					return questions.data.before;
				});
			}).then((t) => {
				return request(`http://www.reddit.com/r/askReddit/hot/.json?count=25&after=${t}`, {json: true}).then((questions) => {
					this.questions = this.questions.concat(questions.data.children.filter((e) => !e.data.stickied && !e.data.over_18));
					return;
				});
			});
		}
		return msg.say(
			this.questions.splice(Math.floor(Math.random() * this.questions.length), 1)[0].data.title
				.replace(/subreddit/gi, 'server')
				.replace(/reddit/gi, 'Discord')
				.replace(/\[serious\]/gi, '')
		);
	}
};
