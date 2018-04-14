const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');
const items = require('../../utils/classes/plantItems');

module.exports = class ShopCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'shop',
			aliases: ['buy'],
			group: 'plant',
			memberName: 'shop',
			description: 'Opens up the shop for you to buy items with.',
			details: 'Opens up the menu, where you can buy items. Items are added and removed often, so be sure to check back often.',
			guildOnly: true,
		});
	}

	async run(msg) {
		const userPlant = await plants.getPlant(msg);
		const allItemsMessage = ['```md', '# Item'.padEnd(34, ' ') + 'Cost'];
		const allClasses = [];
		/* eslint-disable-next-line */
		Object.keys(items).forEach((className, index) => {
			allClasses.push(items[className]);
			const Temp = new allClasses[index]();
			allItemsMessage.push(`[${index}] ${Temp.name.padEnd(30, ' ')}${Temp.cost}`);
		});
		allItemsMessage.push('```\n\nType the number of the item you would like to examine or buy. :leaves: ' + userPlant.getPlantData().leaves);
		msg.say(allItemsMessage.join('\n'));
		const itemSelection = msg.channel.createMessageCollector((m) => m.author.id === msg.author.id && m.channel.id == msg.channel.id, {maxMatches: 1, time: 30000});
		itemSelection.on('collect', (collectedMessage) => {
			let classIndex = parseInt(collectedMessage.cleanContent.replace(/[^0-9]/gi, ''));
			if (classIndex < Object.keys(items).length) {
				/* eslint-disable-next-line */
				const itemClass = new allClasses[classIndex];
				const embed = {
					title: itemClass.name,
					author: {
						name: collectedMessage.member.displayName,
						icon_url: msg.author.displayAvatarURL,
					},
					color: 4353864,
					fields: [
						{
							name: 'Cost',
							value: itemClass.cost,
						},
						{
							name: 'Description',
							value: itemClass.description,
						},
					],
				};
				let affordable = userPlant.getPlantData().leaves >= itemClass.cost;
				if (!affordable) return msg.say('You don\'t have enough leaves to buy this item, but feel free to look.', { embed });
				msg.say('Is this the item you would like to purchase? `Y/N`', { embed }).then(() => {
					const buyConfirm = msg.channel.createMessageCollector((m) =>
						m.author.id === msg.author.id &&
						m.channel.id == msg.channel.id &&
						(
							m.cleanContent.substring(0, 1).toLowerCase() == 'n' ||
							m.cleanContent.substring(0, 1).toLowerCase() == 'y'
						),
						/* eslint-disable-next-line */
						{maxMatches: 1, time: 30000}
					);
					buyConfirm.on('collect', (buyOrNot) => {
						const buying = buyOrNot.cleanContent.substring(0, 1).toLowerCase() == 'y' ? true : false;
						if (buying) {
							userPlant.addToInventory(itemClass.constructor.name);
							userPlant.getPlantData().leaves -= itemClass.cost;
							return plants.storePlant(userPlant).then(() => {
								msg.say(`The item was added to your inventory for a total of ${itemClass.cost} leaves. :shopping_bags:`);
							});
						}
						return msg.say('Shop closed. Have a nice day! :shopping_bags:');
					});
				});
			}
		});
	}
};
