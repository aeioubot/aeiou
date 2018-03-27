const {Command} = require('discord.js-commando');
const request = require('request-promise');
const secure = require('../../secure.json');

module.exports = class YoutubeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'youtube',
			group: 'search',
			memberName: 'youtube',
			description: 'Searches for a video on Youtube.',
			details: 'Searches for a video on Youtube.',
			aliases: ['yt', 'video'],
			examples: ['youtube kodak black', 'youtube but every time it gets faster'],
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
		request({uri: `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&q=${query}&key=${secure.youtube}`, json: true}).then((d) => {
			return msg.say('', {embed: {
				title: d.items[0].snippet.title,
				color: 0xFF2020,
				thumbnail: {
					url: d.items[0].snippet.thumbnails.high.url,
				},
				fields: [{
					name: 'Link',
					value: `http://youtube.com/watch?v=${d.items[0].id.videoId}`,
				}],
			}});
		}).catch((e) => {
			return msg.say('Something went wrong with the search, try again later.');
		}).catch(() => {});
	}
};
