const secure = require('./secure.json');
const Commando = require('discord.js-commando');
const path = require('path');
const SequelizeProvider = require('./providers/Sequelize');
const reactDB = require('./utils/models/creact.js');

const database = require('./database.js');
const donors = require('./utils/models/donor.js');

database.start();

const Aeiou = new Commando.Client({
	owner: ['147604925612818432', '94155927032176640', '296895991985078272'],
	commandPrefix: secure.prefix,
	unknownCommandResponse: false,
	disableEveryone: true,
});

Aeiou.setProvider(new SequelizeProvider(database.db)).catch(console.error);

Aeiou.registry
	.registerGroups([
		['mod', 'Mod commands'],
		['games', 'Game commands'],
		['role', 'Role commands'],
		['fun', 'Fun commands'],
		['tag', 'Tag related commands'],
		['misc', 'Miscellaneous commands'],
		['owner', 'Owner commands'],
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
	Aeiou.owners.find((e) => e.id == '147604925612818432').send('I\'m back.');
});

Aeiou.dispatcher.addInhibitor((msg) => {
	if (!msg.command) return;
	if (msg.member.hasPermission('ADMINISTRATOR') || Aeiou.isOwner(msg.author.id) || msg.command.name === 'ignore') return false;
	return Aeiou.provider.get(msg.guild, 'ignoredChannels', []).includes(msg.channel.id);
});

Aeiou.on('message', async (message) => {
	if (message.author.bot || message.channel.type != 'text') return;
	const reactionObjects = await reactDB.getReacts(message);
	const toSay = reactionObjects.find((reactObject) => {
		if (message.content.toLowerCase() === reactObject.trigger) return reactObject;
	});
	if (toSay) return message.channel.send(toSay.content);
});

Aeiou.on('guildMemberAdd', (member) => {
	donors.getDonors(member).then((donors) => {
		const possibleDonor = donors.find((donorObject) => member.id === donorObject.id);
		if (possibleDonor) {
			member.addRole(member.guild.roles.get(possibleDonor.role)).catch((e) => {/* nothing because there's nothing to respond to, and its not an important error. */});
		}
	});
});

Aeiou.login(secure.token);
