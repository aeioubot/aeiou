const {Command} = require('discord.js-commando');
const request = require('request-promise');

module.exports = class YoutubeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'nsfwimg',
			group: 'search',
			memberName: 'nsfwimg',
			description: 'Searches for an image, supports NSFW results and normal results.',
			details: 'Searches for an image.',
			aliases: ['ni', 'nimg', 'ns'],
			examples: ['nsfwimg kodak black', 'nsfwimg weeb stuff'],
			format: '[query]',
			guildOnly: true,
			args: [
				{
					key: 'query',
					prompt: 'What would you like to search for?',
					type: 'string',
				},
			],
		});
	}

	hasPermission(msg) {
		if (msg.member.hasPermission('ADMINISTRATOR') || this.client.isOwner(msg.author.id)) return true;
		if (msg.channel.nsfw) return true;
		return 'You can only use this command in NSFW channels.';
	}

	async run(msg, {query}) {
		if (msg.member.currentSearch && !msg.member.currentSearch.ended) msg.member.currentSearch.stop();
		let sayResult = async (data) => {
			try {
				await msg.say('Type "next" for the next search result.', {embed: {
					title: `Image result for "${query}"`,
					color: 0x4885ED,
					image: {
						url: data.splice(0, 1)[0].url,
					},
				}});
			} catch (e) {
				return msg.say('There are no more results for this search.').catch(() => {});
			}
			msg.member.currentSearch = msg.channel.createMessageCollector((m) => m.author.id == msg.author.id && m.channel.id == msg.channel.id && m.content.toLowerCase() == 'next', {time: 30000, maxMatches: 1});
			msg.member.currentSearch.on('collect', () => sayResult(data));
			return;
		};

		request({
			uri: `http://api.ababeen.com/api/images.php?count=10&q=${query}`,
			json: true,
			headers: {
				'User-Agent': 'Aeiou Bot',
			},
		}).then((d) => {
			sayResult(d);
		}).catch((e) => {
			console.log(e);
			return msg.say('Something went wrong with this search.').catch(() => {});
		});
	}
};
