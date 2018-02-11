const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'rename',
			group: 'plant',
			memberName: 'rename',
			description: 'Renames a seed.',
			details: 'Renames a seed.',
			examples: ['!rename 3 stupid idiot seed', 'rename 9 pretty beautiful seed mad stats 100%\'d'],
			format: '[seed number] [new name]',
			guildOnly: true,
			args: [
				{
					key: 'seedIndex',
					prompt: 'Which seed would you like to rename?',
					type: 'integer',
				},
				{
					key: 'newName',
					prompt: 'What would you like to rename the seed to?',
					type: 'string',
				},
			],
		});
	}

	async run(msg, {seedIndex, newName}) {
		return plants.getPlant(msg).then(plantClass => {
			if (!plantClass.rename(seedIndex, newName).success) return msg.say("You chose an invalid seed number. Use `!seeds` to check your seeds.");
			plants.storePlant(plantClass).then(() => msg.say("Your seed has been renamed. :seedPouch:"));
		});
	}
};
