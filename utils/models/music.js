const ytdl = require('ytdl-core');
const streamOptions = { seek: 0, volume: 1};
const ytdlOptions = { quality: 'highestaudio', filter: 'audioonly'};

const guilds = {};

module.exports = {
	play: (song, msg) => {
		guilds[msg.guild.id] = guilds[msg.guild.id] || {queue: [], playing: false};
		const connection = guilds[msg.guild.id].connection;
		if (!connection) return msg.say('No connection aaaaaaa');
		msg.say('play connection status: ' + guilds[msg.guild.id].connection.status)
		const stream = ytdl(`http://youtube.com/watch?v=${song.id}`, ytdlOptions);
		console.log('now play ' + song.title + '!');
		console.log(stream);
		msg.say('now play ' + song.title + '!');
		let dispatcher = connection.playStream(stream, streamOptions);
		msg.say('play connection status: ' + guilds[msg.guild.id].connection.status)
		guilds[msg.guild.id].playing = true;
		dispatcher.on('end', function() {
			msg.say('dispatcher ended!');
			msg.say('end connection status: ' + guilds[msg.guild.id].connection.status)
			guilds[msg.guild.id].playing = false;
			if (guilds[msg.guild.id].queue.length === 0) return msg.say('song END :(');
			module.exports.play(guilds[msg.guild.id].queue.shift(), msg);
		});
	},

	queue: async (song, msg) => {
		guilds[msg.guild.id] = guilds[msg.guild.id] || {queue: [], playing: false};
		if (guilds[msg.guild.id].playing) {
			guilds[msg.guild.id].queue.push(song);
			return msg.say('OK q :)');
		}
		msg.guild.channels.get(msg.member.voiceChannelID).join().then(conn => {
			guilds[msg.guild.id].connection = conn;
			msg.say('ssss connection status: ' + guilds[msg.guild.id].connection.status)
			module.exports.play(song, msg);
		});
	},

	skip: async (msg) => {
		msg.say('finna s k i p bois')
		return guilds[msg.guild.id].dispatcher.end();
	},

	getQueue: (msg) => {
		return guilds[msg.guild.id].queue;
	},
};
