const {Command} = require('discord.js-commando');
const request = require('request-promise');

module.exports = class YoutubeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'image',
			group: 'search',
			memberName: 'image',
			description: 'Searches for an image.',
			details: 'Searches for an image.',
			aliases: ['i', 'img'],
			examples: ['image kodak black', 'image '],
			format: '[query]',
			guildOnly: false,
			args: [
				{
					key: 'query',
					prompt: 'What would you like to search for?',
					type: 'string',
				},
			],
		});
	}

	async run(msg, {query}) {
		let sayResult = async () => {
			try {
				await msg.say('Type "next" for the next search result.', {embed: {
					title: `Image result for "${this.data.query.query}"`,
					color: 0x4885ED,
					image: {
						url: this.data.result.items.splice(0, 1)[0].media,
					},
				}});
			} catch (e) {
				return msg.say('There are no more results for this search.').catch(() => {});
			}
			return msg.channel.createMessageCollector((m) => m.author.id != this.client.user.id && m.channel.id == msg.channel.id && m.content.toLowerCase() == 'next', {time: 30000, maxMatches: 1})
				.on('collect', () => sayResult());
		};

		request({
			uri: `https://api.qwant.com/api/search/images?count=10&offset=1&q=${query}`,
			json: true,
			headers: {
				'User-Agent': 'Aeiou',
			},
		}).then((d) => {
			this.data = d.data;
			sayResult();
		}).catch((e) => {
			console.log(e);
			return msg.say('Something went wrong with this search.').catch(() => {});
		});
	}
};
