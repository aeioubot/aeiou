const secure = require('./secure.json');
const Commando = require('discord.js-commando');
const path = require('path');
const SequelizeProvider = require('./providers/Sequelize');
const plants = require('./utils/models/plants.js');
const database = require('./database.js');
const donors = require('./utils/models/donor.js');
const msgListeners = require('./utils/messageListeners.js');
const creacts = require('./utils/models/creact.js');

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
		['donor', 'Donor commands'],
		['fun', 'Fun commands'],
		['plant', 'Plant commands'],
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
	plants.startTimer().then(console.log("Plant timers have been started!"));
	creacts.buildReactCache().then(console.log("Custom reactions db constructed!"));

	console.log(`              _
             (_)
  ____   ___  _   ___   _   _
 / _  | / _ \\| | / _ \\ | | | |
| (_| ||  __/| || (_) || |_| |
 \\__,_| \\___||_| \\___/  \\__,_|

Ready to be used and abused!`);
});

Aeiou.on('message', async (message) => {
	msgListeners.creact(message);
	msgListeners.plantSeed(message);
});

Aeiou.on('guildMemberAdd', (member) => {
	donors.getDonors(member).then((donors) => {
		const possibleDonor = donors.find((donorObject) => member.id === donorObject.id);
		console.log(possibleDonor);
		if (possibleDonor) {
			member.addRole(member.guild.roles.get(possibleDonor.role)).catch((e) => {/* nothing because there's nothing to respond to, and its not an important error. */});
		}
	});
});

Aeiou.login(secure.token);
