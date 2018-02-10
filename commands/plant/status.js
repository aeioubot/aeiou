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
		});
	}

	async run(msg) {
		const plantData = await plants.getPlant(msg).then(plant => plant.getPlantData());
		if (!plantData.activeSeed) return msg.say("You don't have a seed planted currently.");

		const embed = {
			title: titles[Math.floor(Math.random() * titles.length)],
			color: 4353864,
			thumbnail: {
				url: `${thumbnailURLs[Math.floor(plantData.progress / 10)]}`,
			},
			image: {
				url: "https://i.imgur.com/ADn4piz.png",
			},
			author: {
				name: msg.member.displayName,
				icon_url: msg.author.displayAvatarURL,
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
