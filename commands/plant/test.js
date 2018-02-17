const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'test',
			group: 'plant',
			memberName: 'test',
			description: 'asd',
			details: 'asd',
			examples: ['asd', 'asd'],
			guildOnly: true,
			// args: [
			// 	{
			// 		key: '',
			// 		prompt: '',
			// 		type: '',
			// 		default: '',
			// 		format: '[]',
			// 	},
			// ],
		});
	}

	async run(msg, args) {
		await plants.testTick();
		const myPlant = await plants.getPlant(msg);
		myPlant.addToSeeds({
			name: 'asd',
			growthRate: 100,
			leafiness: 100,
			waterAffinity: 100,
		});
		plants.storePlant(myPlant);
		console.log(myPlant);
	}
};
