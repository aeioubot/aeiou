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
	])
	.registerDefaults()
	.registerCommandsIn(path.join(__dirname, 'commands'));

Aeiou.on('ready', () => {
	console.log('lets do it');
});

Aeiou.on('message', (msg) => {
	if (msg.author.id == Aeiou.user.id) return;
	msg.channel.send(`${msg.author.username} said "${msg.content}"`);
});

Aeiou.setProvider(
	sqlite.open(path.join(__dirname, 'settings.sqlite3')).then((settingsProvider) => new Commando.SQLiteProvider(settingsProvider))
).catch(console.error);

Aeiou.login(secure.discordAPIKey);
