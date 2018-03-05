const {Command} = require('discord.js-commando');
const definitions = {
	plants: `\`\`\`md
#Welcome to plants!
Plants is an idling game built into Aeiou to help you grow a flower.
To begin, you need to collect a seed. This can be done with <!dig> every few hours, or by reacting to messages with '🌰' when Aeiou does every so often.
Once you've collected a seed, you can view it with <!seeds>.

Now, plant your seed with <!plant [seed number]>, water your plant (or your friends!) with <!water>, and wait for it to grow!
Once it's fully grown, you can harvest it with <!harvest>.

See the full list of commands avilable with <!help>, under "Plant commands".
\`\`\``,
};

module.exports = class BeginCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'begin',
			group: 'misc',
			memberName: 'begin',
			description: 'Contains information on how to begin the various games Aeiou has.',
			details: 'Contains information on how to begin the various games Aeiou has.',
			args: [
				{
					key: 'helpItem',
					label: 'help item',
					prompt: 'yolo pppbbbbt asndasndajdna dasndkajnskjnxajksnd zaop is cool and good heh',
					default: '',
					type: 'string',
					parse: (str) => str.toLowerCase().trim(),
				},
			],
		});
	}

	async run(msg, { helpItem }) {
		if (!helpItem) {
			return msg.say(`You didn\'t provide a valid option, the available help items are: \`\`\`${Object.keys(definitions).join(',')}\`\`\``);
		}
		const test = await msg.say('I\'m DMing information to you!');
		return msg.author.send(definitions[helpItem])
			.then(() => {
				setTimeout(() => test.delete(), 5000);
			})
			.catch(() => {
				test.edit('I wasn\'t able to DM you...');
			});
	}
};
