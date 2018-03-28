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
			examples: ['image kodak black', 'image weeb stuff'],
			format: '[query]',
			guildOnly: true,
			throttling: {usages: 1, duration: 30},
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
		if (msg.member.currentSearch && !msg.member.currentSearch.ended) msg.member.currentSearch.stop();
		let sayResult = async () => {
			try {
				await msg.say('Type "next" for the next search result.', {embed: {
					title: `Image result for "${query}"`,
					color: 0x4885ED,
					image: {
						url: this.data.result.items.splice(0, 1)[0].media,
					},
				}});
			} catch (e) {
				return msg.say('There are no more results for this search.').catch(() => {});
			}
			msg.member.currentSearch = msg.channel.createMessageCollector((m) => m.author.id == msg.author.id && m.channel.id == msg.channel.id && m.content.toLowerCase() == 'next', {time: 120000, maxMatches: 1});
			msg.member.currentSearch.on('collect', () => sayResult());
			return;
		};

		request({
			uri: `https://api.qwant.com/api/search/images?count=10&offset=1&q=${query}`,
			json: true,
			headers: {
				'User-Agent': `${new Date().getTime()}`,
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
