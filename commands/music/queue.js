const {Command} = require('discord.js-commando');
const music = require('../../utils/models/music.js');

module.exports = class QueueCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'queue',
			group: 'music',
			memberName: 'queue',
			description: 'Shows the music queue.',
			details: 'Shows the music queue.',
			aliases: ['q'],
			examples: ['queue'],
			format: '',
			guildOnly: true,
		});
	}

	async run(msg, { query }) {
		return msg.say('```' + music.getQueue(msg).map((song, index) => {
			return (index+1) + '. ' + song.title;
		}).join('\n') + '```');
	}
};
