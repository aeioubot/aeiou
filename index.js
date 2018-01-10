const secure = require('./secure.json');
const Commando = require('discord.js-commando');
const path = require('path');
const sqlite = require('sqlite');

const Aeiou = new Commando.Client({
	owner: '147604925612818432',
	commandPrefix: '!',
	unknownCommandResponse: false,
});

Aeiou.registry
	.registerGroups([
		['mod', 'Mod commands'],
		['some', 'Some group'],
		['other', 'Some other group'],
		['core', 'Core commands'],
		['fun', 'Fun commands']
	])
	.registerDefaultTypes()
	.registerDefaultGroups()
	.registerDefaultCommands({
		ping: false
	})
	.registerCommandsIn(path.join(__dirname, 'commands'));

Aeiou.on('ready', () => {
	console.log(`              _
             (_)
  __ _   ___  _   ___   _   _
 / _ˋ | / _ \\| | / _ \\ | | | |
| (_| ||  __/| || (_) || |_| |
 \\__,_| \\___||_| \\___/  \\__,_|

Successfully started!`);
});

Aeiou.on('message', (msg) => {
	if (msg.author.id == Aeiou.user.id) return;
	console.log(`${msg.author.username} said "${msg.content}"`);
});

Aeiou.on('message', async (message) => {
	if(message.author.bot) return;
	var reactionObject = Aeiou.provider.get(message.guild, 'customReactions', []);
	var toSay = reactionObject.find((x) => {
		if(message.content == x.trigger) return x
	});
	if(toSay) return message.channel.send(toSay.content);
});

Aeiou.setProvider(
	sqlite.open(path.join(__dirname, 'settings.sqlite3')).then((settingsProvider) => new Commando.SQLiteProvider(settingsProvider))
).catch(console.error);

Aeiou.login(secure.discordAPIKey);
