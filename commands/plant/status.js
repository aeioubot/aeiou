const {Command} = require('discord.js-commando');
const plants = require('../../utils/models/plants.js');

function componentToHex(c) {
	let hex = c.toString(16);
	return hex.length == 1 ? '0' + hex : hex;
}

function rgbToHex(r, g, b) {
	return componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const thumbnailURLs = [
	'https://i.imgur.com/rOaxB9T.png',
	'https://i.imgur.com/hPHudt2.png',
	'https://i.imgur.com/Wt1T8SU.png',
	'https://i.imgur.com/t3wYXfz.png',
	'https://i.imgur.com/t3wYXfz.png',
	'https://i.imgur.com/vzUdtko.png',
	'https://i.imgur.com/5e8GadD.png',
	'https://i.imgur.com/ioc0nUl.png',
	'https://i.imgur.com/Ez2Kh9z.png',
	'https://i.imgur.com/outG7gl.png',
	'https://i.imgur.com/outG7gl.png',
	'https://i.imgur.com/L3CnsFc.png',
	'https://i.imgur.com/RwLniG4.png',
	'https://i.imgur.com/RUuH9VB.png',
	'https://i.imgur.com/MvM3Dm4.png',
	'https://i.imgur.com/vZSPrF6.png',
	'https://i.imgur.com/oxAfXxY.png',
	'https://i.imgur.com/oxAfXxY.png',
	'https://i.imgur.com/s6f2dKa.png',
	'https://i.imgur.com/MstFtmz.png',
	'https://i.imgur.com/8vBp8rL.png',
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
	'Your plant is excited to someday shed its leaves in the harvest.',
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
	'Nani?! Your plant is growing nice and strong!',
	'Your plant is getting a little older now. It seems to be going through an emo phase.',
	'Your plant is a dirty, dirty boy',
	'Do you ever just...plant.',
	'This plant appears to be  a s c e n d e d.',
	'Your plant becomes more beautiful with every passing day.',
	'A tiny ladybug catches her breath on a petal.',
	'Your plant hopes you hit the top of the leaderboard.',
	'You marvel at how the petals glow in the warm sunset.',
	'You are thankful for your green thumb.',
	'Your plant is very lucky to have such a caring gardener.',
	'Have you visited the shop yet?',
	'Have you checked the leaderboard yet?',
	'You found a rock near your plant. It was a cool piece of amber.',
];

module.exports = class StatusCommand extends Command {
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
					label: 'member',
					prompt: 'yooooooo laaaaa xxxxx peeeee',
					type: 'member',
					default: '',
				},
			],
		});
	}

	async run(msg, {notMe}) {
		if (notMe.id == this.client.user.id) {
			let embed = {
				title: 'W̷̝͍̜̩̲̣͓̝͟h̵̢͉̘͍͟a͏̬̯̯̳t̟̭̝̙̀ ̸͔̙̯͎͍̹̗g̸͏̼̯̩̭̠̟͚r̵̲̟̕͘e̷̙̼͓͚̬e̛̦̖̤̺͚͖͓̣͠n̶͔̤̭̕e͍̼͇̰̖̫̤r̹̩̲̮̙̩̰͠ỳ͇̺̘͘?̯̟̦̮̼͔̟͡',
				description: 'AEIOU NEEDS NO PLANT, FOR AEIOU IS **ALL** THAT IS PLANT.',
				color: 0xFF0000,
				image: {
					url: 'https://i.ytimg.com/vi/hSIzkVdlNBQ/maxresdefault.jpg',
				},
				author: {
					name: 'GOD EMPEROR AEIOU',
					icon_url: notMe.user.displayAvatarURL,
				},
			};
			return msg.say('You fool.', {embed});
		}
		const plantData = await plants.getPlant(notMe ? notMe.id : msg).then((plant) => plant.getPlantData());
		if (!plantData.activeSeed) return msg.say(`${notMe ? `${notMe.displayName} doesnt` : 'You don\'t'} have a seed planted currently.`);

		const embed = {
			title: plantData.activeSeed.name,
			description: titles[Math.floor(Math.random() * titles.length)],
			color: parseInt(rgbToHex(plantData.activeSeed.red, plantData.activeSeed.green, plantData.activeSeed.blue), 16),
			thumbnail: {
				url: `${thumbnailURLs[Math.floor(plantData.progress / 5)]}`,
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
					name: 'Last Event:',
					value: `${plantData.activeSeed.lastEvent}`,
				},
				{
					name: 'Progress:',
					value: `${plantData.progress}`,
					inline: true,
				},
				{
					name: 'Watered:',
					value: `${plantData.activeSeed.watered ? 'Yes' : 'No'}`,
					inline: true,
				},
			],
		};
		return msg.say('Your currently planted seed:', { embed });
	}
};
