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
		return request('http://www.reddit.com/r/askReddit/hot/.json?count=50', {json: true}).then((questions) => {
			msg.channel.startTyping();
			return msg.say(
				questions.data.children.filter((e) => !e.data.stickied)[Math.floor(Math.random() * questions.data.children.length)].data.title
					.replace(/reddit/gi, 'Discord')
					.replace(/\[serious\]/gi, '')
			).then(msg.channel.stopTyping());
		}).catch(() => msg.say('Something went wrong, try again later.')).catch(() => {});
	}
};
