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
			format: '[asd]',
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
		plants.getAllPlants().then(data => {
			data.forEach((x) => {
				x.hourly();
			});
			plants.storeAllPlants(data);
		});
	}
};
