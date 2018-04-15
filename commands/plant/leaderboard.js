const {Command} = require('discord.js-commando');
const permissions = require('../../utils/models/permissions.js');
const plants = require('../../utils/models/plants.js');

module.exports = class LeaderboardCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'leaderboard',
			aliases: ['leaderboards', 'top', 'lb'],
			group: 'plant',
			memberName: 'leaderboard',
			description: 'See the top leafholders ever.',
			details: 'See the top leafholders ever.',
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

	async run(msg, { notMe }) {
		if (!await permissions.hasPermission(this.name, msg)) return msg.say(`You don't have permission to use this command.`);
		let allPlants = await plants.getAllPlants();
		allPlants = allPlants.filter((plant) => msg.guild.members.get(plant.user) !== undefined);
		allPlants.sort((a, b) => b.getPlantData().leaves - a.getPlantData().leaves);
		const idScan = notMe ? notMe.id : msg.member.id;
		const myIndex = allPlants.findIndex((plant) => idScan == plant.user);
		const importantPeople = allPlants.splice(0, 10);
		const embed = {
			title: 'Here are the top leaf holders.',
			color: 4353864,
			thumbnail: {
				url: 'https://i.imgur.com/ADn4piz.png',
			},
			fields: [],
		};
		importantPeople.forEach((plant, i) => {
			let username;
			try {
				username = this.client.users.get(plant.user).username;
			} catch (e) {
				username = plant.user;
			}
			embed.fields.push({
				name: `${i+1}. ${username}`,
				value: plant.getPlantData().leaves,
			});
		});
		return msg.say(`${notMe ? `**${notMe.displayName}'s**` : 'Your'} position on the **${msg.guild.name}** leaderboards: ` + (myIndex + 1), {embed});
	}
};
