const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');
const items = require('../../utils/classes/plantItems');

module.exports = class ShopCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'shop',
			group: 'plant',
			memberName: 'shop',
			description: 'Opens up the shop for you to buy items with.',
			details: 'Opens up the menu, where you can buy items. Items are added and removed often, so be sure to check back often.',
			guildOnly: true,
		});
	}

	async run(msg) {
		const allItemsMessage = ['```md', '# Item'.padEnd(34, ' ') + 'Cost'];
		/* eslint-disable-next-line */
		Object.keys(items).forEach((className, index) => {
			let Temp = items[className];
			Temp = new Temp();
			allItemsMessage.push(`[${index}] ${Temp.name.padEnd(30, ' ')}${Temp.cost}`);
		});
		allItemsMessage.push('```\n\nType the number of the item you would like to examine or buy.');
		msg.say(allItemsMessage.join('\n'));
	}
};
