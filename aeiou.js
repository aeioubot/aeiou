const secure = require('./secure.json');
const Commando = require('discord.js-commando');
const path = require('path');
const SequelizeProvider = require('./utils/Sequelize');
const messageListeners = require('./utils/messageListeners.js');
const database = require('./database.js');
const donors = require('./utils/models/donor.js');

database.start();

const Aeiou = new Commando.Client({
	owner: ['147604925612818432', '94155927032176640'],
	commandPrefix: secure.prefix,
	unknownCommandResponse: false,
	disableEveryone: true,
});

Aeiou.setProvider(new SequelizeProvider(database.db)).catch(console.error);

Aeiou.registry
	.registerGroups([
		['mod', 'Mod commands'],
		['games', 'Game commands'],
		['plant', 'Plant commands'],
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
	require('./utils/models/creact.js').buildReactCache().then(console.log('Reactions cache built!'));
	console.log(`              _
             (_)
  __ _   ___  _   ___   _   _
 / _ˋ | / _ \\| | / _ \\ | | | |
| (_| ||  __/| || (_) || |_| |
 \\__,_| \\___||_| \\___/  \\__,_| ${Aeiou.shard.id}

Ready to be used and abused!`);
});

Aeiou.dispatcher.addInhibitor((msg) => {
	if (!msg.command) return false;
	if (msg.channel.type == 'dm') return false;
	if (msg.member.hasPermission('ADMINISTRATOR') || Aeiou.isOwner(msg.author.id) || msg.command.name === 'ignore') return false;
	return Aeiou.provider.get(msg.guild, 'ignoredChannels', []).includes(msg.channel.id);
});

Aeiou.on('message', async (message) => {
	messageListeners.creact(message);
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
