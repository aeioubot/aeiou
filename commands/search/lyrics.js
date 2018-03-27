const {Command} = require('discord.js-commando');
const request = require('request-promise');

module.exports = class LyricsCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'lyrics',
			group: 'search',
			memberName: 'lyrics',
			description: 'Searches for a song on Genius.',
			details: 'Searches for a song on Genius.',
			examples: ['!lyrics Element Kendrick Lamar', '!lyrics Marvin Gaye Let\'s get it on'],
			format: '[query]',
			args: [
				{
					key: 'query',
					prompt: 'What would you like to search Genius for?',
					type: 'string',
					default: 'XO Tour Llif3 Uzi',
				},
			],
		});
	}

	async run(msg, {query}) {
		return request(`https://api.genius.com/search?access_token=${require('../../secure.json').genius}&q=${query}`, {json: true})
			.then(async (d) => {
				const targetResult = d.response.hits[0].result;
				const embed = {
					color: 0xFFFF64,
					title: `${targetResult.primary_artist.name} - ${targetResult.title}`,
					thumbnail: {url: targetResult.song_art_image_thumbnail_url},
					fields: [{name: 'Link', value: `https://genius.com${targetResult.api_path}`}],
				};
				msg.say('', {embed});
			})
			.catch((e) => msg.say('I didn\'t find a song by that title, try another.'))
			.catch(() => {});
	}
};
