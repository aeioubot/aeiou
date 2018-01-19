const secure = require('./secure.json');
const Commando = require('discord.js-commando');
const path = require('path');
const SequelizeProvider = require('./providers/Sequelize');

const database = require('./database.js');

database.start();

const Aeiou = new Commando.Client({
	owner: ['147604925612818432', '94155927032176640'],
	commandPrefix: secure.prefix,
	unknownCommandResponse: false,
});

Aeiou.setProvider(new SequelizeProvider(database.db)).catch(console.error);

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
});

Aeiou.on('message', async (message) => {
	if (message.author.bot) return;
	const reactionObjects = Aeiou.provider.get(message.guild, 'customReactions', []);
	const toSay = reactionObjects.find(reactObject => {
		if (message.content === reactObject.trigger) return reactObject;
	});
	if (toSay) return message.channel.send(toSay.content);
});

Aeiou.login(secure.token);
