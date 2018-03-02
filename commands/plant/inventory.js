const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');
const items = require('../../utils/classes/plantItems');

module.exports = class ShopCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'inventory',
			aliases: ['inv'],
			group: 'plant',
			memberName: 'inventory',
			description: 'Shows the items you have in your inventory.',
			details: 'Shows the items you have in your inventory, and allows you to use them.',
			guildOnly: true,
			args: [
				{
					key: 'itemNumber',
					label: 'item number',
					prompt: 'yolo pppbbbbt asndasndajdna dasndkajnskjnxajksnd zaop is cool and good heh',
					default: '-1',
					type: 'integer',
				},
			],
		});
	}

	async run(msg, { itemNumber }) {
		const userPlant = await plants.getPlant(msg);
		if (itemNumber == -1) {
			const displayMessage = ['```md', '# Item'];
			if (userPlant.getPlantData().inventory.length < 1) return msg.say('You don\'t have any items, visit the `!shop` to buy some!');
			userPlant.getPlantData().inventory.forEach((itemName, index) => {
				displayMessage.push(`[${index}] ${new items[itemName]().name}`);
			});
			displayMessage.push('```');
			displayMessage.push('\nType `!inventory <item number>` to use it on your active plant.');
			return msg.say(displayMessage.join('\n'));
		}
		if (itemNumber >= userPlant.getPlantData().length) return msg.say('You don\'t have an item by that number.');
		if (!userPlant.getPlantData().activeSeed) return msg.say('You don\'t have an active seed to use this item on.');
		new items[userPlant.getPlantData().inventory[itemNumber]]().use(userPlant);
		userPlant.removeFromInventory(itemNumber);
		return plants.storePlant(userPlant).then(() => msg.say('You used the item. :sparkles:'));
	}
};
