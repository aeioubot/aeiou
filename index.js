const secure = require('./secure.json');
const Commando = require('discord.js-commando');
const path = require('path');
const sqlite = require('sqlite');
const database = require('./database.js');

const Aeiou = new Commando.Client({
	owner: ['147604925612818432', '94155927032176640'],
	commandPrefix: '!',
	unknownCommandResponse: false,
});

Aeiou.registry
	.registerGroups([
		['mod', 'Mod commands'],
		['donor', 'Donor commands'],
		['fun', 'Fun commands'],
		['tag', 'Tag related commands'],
	])
	.registerDefaultTypes()
	.registerDefaultGroups()
	.registerDefaultCommands({
		ping: false,
	})
	.registerCommandsIn(path.join(__dirname, 'commands'));

Aeiou.on('ready', () => {
	console.log(`              _
             (_)
  __ _   ___  _   ___   _   _
 / _ˋ | / _ \\| | / _ \\ | | | |
| (_| ||  __/| || (_) || |_| |
 \\__,_| \\___||_| \\___/  \\__,_|

Ready to be used and abused!`);
	database.start();
});

Aeiou.on('message', (msg) => {

});

Aeiou.on('message', async (message) => {
	if (message.author.bot) return;
	let reactionObjects = Aeiou.provider.get(message.guild, 'customReactions', []);
	let toSay = reactionObjects.find((reactObject) => {
		if (message.content == reactObject.trigger) return reactObject;
	});
	if (toSay) return message.channel.send(toSay.content);
});

Aeiou.setProvider(
	sqlite.open(path.join(__dirname, 'settings.sqlite3')).then((settingsProvider) => new Commando.SQLiteProvider(settingsProvider))
).catch(console.error);

Aeiou.login(secure.discordAPIKey);
