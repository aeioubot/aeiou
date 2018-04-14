const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');

module.exports = class RenameCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'rename',
			group: 'plant',
			memberName: 'rename',
			description: 'Renames a seed or your plant.',
			details: 'Renames a seed or your plant.',
			examples: ['!rename plant great plant', 'rename 9 pretty beautiful seed mad stats 100%\'d'],
			format: '[seed number OR "plant"] [new name]',
			guildOnly: true,
			args: [
				{
					key: 'seedIndex',
					label: 'seed number',
					prompt: 'Which seed would you like to rename? Type "plant" for your plant.',
					type: 'string',
				},
				{
					key: 'newName',
					prompt: 'What would you like to rename the seed/plant to?',
					type: 'string',
				},
			],
		});
	}

	async run(msg, {seedIndex, newName}) {
		if (isNaN(parseInt(seedIndex))) seedIndex = -1;
		return plants.getPlant(msg).then((plantClass) => {
			if (!plantClass.rename(parseInt(seedIndex), newName).success) return msg.say('You chose an invalid seed number. Use `!seeds` to check your seeds.');
			plants.storePlant(plantClass).then(() => msg.say(`Your ${seedIndex == -1 ? 'plant' : 'seed'} has been renamed. <:seedPouch:411660762470416399>`));
		});
	}
};
