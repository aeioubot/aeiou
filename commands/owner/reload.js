const { oneLine, stripIndents } = require('common-tags');
const {Command} = require('discord.js-commando');
const disambiguation = require('../../node_modules/discord.js-commando/src/util').disambiguation;
const GatewayCommand = require('../../utils/classes/GatewayCommand');


module.exports = class ReloadCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reload',
			aliases: ['reload-command'],
			group: 'owner',
			memberName: 'reload',
			description: 'Reloads a command or command group.',
			details: oneLine`
				The argument must be the name/ID (partial or whole) of a command or command group.
				Providing a command group will reload all of the commands in that group.
				Only the bot owner(s) may use this command.
			`,
			examples: ['reload some-command'],
			args: [
				{
					key: 'cmdOrGrp',
					label: 'command/group',
					type: 'string',
					prompt: 'Which command or group would you like to reload?',
					validate: val => {
						if (!val) return false;
						const groups = this.client.registry.findGroups(val);
						if (groups.length === 1) return true;
						const commands = this.client.registry.findCommands(val);
						if (commands.length === 1) return true;
						if (commands.length === 0 && groups.length === 0) return false;
						return stripIndents`
							${commands.length > 1 ? disambiguation(commands, 'commands') : ''}
							${groups.length > 1 ? disambiguation(groups, 'groups') : ''}
						`;
					},
				},
			],
		});
	}

	hasPermission(msg) {
		return this.client.isOwner(msg.author);
	}

	async run(msg, {cmdOrGrp}) {
		return this.client.gateway.sendMessage(new GatewayCommand( // Sends a gateway command to reload a command on all shards.
			this.client.shard.count,
			this.client.shard.id,
			'reloadCommand',
			[],
			{
				cmdOrGrp: cmdOrGrp,
			},
		)).then(d => {
			const say = d.map((e, i) => `Shard ${i}: ${e ? 'reloaded ' + cmdOrGrp + '.' : 'ERR!'}`); // Says all shards reload status.
			return msg.say(`\`\`\`json\n${say.join('\n')}\`\`\``);
		});
	}
};
