const {Command} = require('discord.js-commando');
const request = require('request-promise');
const secure = require('../../secure.json');
const music = require('../../utils/models/music.js');

module.exports = class PlayCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'play',
			group: 'music',
			memberName: 'play',
			description: 'Searches for a video on Youtube and plays it.',
			details: 'Searches for a video on Youtube and plays it.',
			aliases: ['p'],
			examples: ['play despacito'],
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

	async run(msg, { query }) {
		if (!msg.member.voiceChannelID) return msg.say('Please join a voice channel!');
		request({uri: `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&q=${query}&key=${secure.youtube}`, json: true}).then((d) => {
			music.queue({
				title: d.items[0].snippet.title,
				id: d.items[0].id.videoId,
				thumbnail: d.items[0].snippet.thumbnails.high.url,
			}, msg);
			return msg.say('Queued:', {embed: {
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
