const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');

const thumbnailURLs = [
	"https://i.imgur.com/9HSr8QU.png",
	"https://i.imgur.com/9HSr8QU.png",
	"https://i.imgur.com/LkYU3AM.png",
	"https://i.imgur.com/LkYU3AM.png",
	"https://i.imgur.com/Kxoo9GP.png",
	"https://i.imgur.com/Kxoo9GP.png",
	"https://i.imgur.com/buheSnn.png",
	"https://i.imgur.com/h7KsLl3.png",
	"https://i.imgur.com/N6U8yHr.png",
	"https://i.imgur.com/7W6n95s.png",
	"https://i.imgur.com/7W6n95s.png",
];

const titles = [
	'Today is a beautiful day, and your plant knows it.',
	'Your plant is enojoying basking in the sun.',
	'The warmth of the sun makes your plant happy.',
	'As you take in the sun, so does your plant.',
	'Roots deep, your plant prepares for the day.',
	'A warm sun makes for a happy plant.',
	'A little bit cloudy, but your plant doesnt seem to mind.',
	'Is this thing on?',
	'You can tell it\'s not a succulent by how thirsty it is.',
	'It might be Wednesday, my dudes.',
	'Your plant stretches its leaves to embrace the sunshine.',
	'A cool wind rustles your plant, but it is learning to stay strong.',
	'Your plant loves listening to you, even if it cannot reply.',
	'You wonder what kind of music your plants like.',
	'Your plant is excited to someday shed its leaves in the harvest',
	'Your plant loves the summer heat, but it doesn\'t mind chilling.',
	'You wonder if you should knit your plant a little hat for the winter.',
	'Hi, my name is Planty Bee, and I am from the Bronx.',
	'Your plant flexes in the wind instead of snapping. Perhaps you could learn something.',
	'Your plant is never afraid to turn over a new leaf.',
	'Your plant appreciates your patience.',
	'Swaying in the breeze, you could swear your plant is dancing.',
	'What color do you think your plant’s flower will become?',
	'It grows, it grows, it grows, it grows, yuh!',
	'Your plant seems tranquil today, simply observing the world around it.',
	'A blackbird lands in the garden and chirps inquisitively at the growing seed.',
	'A calico kitten waddles into the garden, his curiosity getting the best of him.',
	'You decide to take a break from your hard work gardening and enjoy a sip of water alongside your plant.',
	'You study your thumb, wondering when it’ll turn green.',
];

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'status',
			aliases: ['progress'],
			group: 'plant',
			memberName: 'status',
			description: 'Displays the status of your current plant.',
			details: 'Displays the status of your current plant.',
			examples: ['status'],
			guildOnly: true,
			args: [
				{
					key: 'notMe',
					prompt: 'yooooooo laaaaa xxxxx peeeee',
					type: 'member',
					default: '',
					format: '[member]',
				},
			],
		});
	}

	async run(msg, {notMe}) {
		const plantData = await plants.getPlant(notMe ? notMe.id : msg).then(plant => plant.getPlantData());
		if (!plantData.activeSeed) return msg.say(`${notMe ? `${notMe.displayName} doesnt` : "You don't"} have a seed planted currently.`);

		const embed = {
			title: plantData.activeSeed.name,
			description: titles[Math.floor(Math.random() * titles.length)],
			color: 4353864,
			thumbnail: {
				url: `${thumbnailURLs[Math.floor(plantData.progress / 10)]}`,
			},
			// image: {
			// 	url: "https://i.imgur.com/ADn4piz.png",
			// },
			author: {
				name: notMe ? notMe.displayName : msg.member.displayName,
				icon_url: notMe ? notMe.user.displayAvatarURL : msg.author.displayAvatarURL,
			},
			fields: [
				{
					name: "Last Event:",
					value: `${plantData.activeSeed.lastEvent}`,
				},
				{
					name: "Progress:",
					value: `${plantData.progress}`,
					inline: true,
				},
				{
					name: "Watered:",
					value: `${plantData.activeSeed.watered ? "Yes" : "No"}`,
					inline: true,
				},
			],
		};
		return msg.say("Your currently planted seed:", { embed });
	}
};
