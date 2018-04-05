const creacts = require('../models/creact.js');

class Gateway {
	constructor(client) {
		this.client = client;
		this.commands = require('require-all')({
			dirname: __dirname,
			filter: (n) => n == 'Gateway.js' ? false : n.slice(0, -3),
		});
	}

	async callCommand(name, opts) {
		if (this.commands[name]) {
			try {
				return this.commands[name](this.client, opts);
			} catch (e) {
				return e;
			}
		}
	}

	processMessage(response) {
		if (response.command === 'customReacts') {
			creacts.allGuildReactions = response.data;
			console.log(`[Shard ${this.client.shard.id}] Cached reactions for ${response.guilds} guilds!`);
		}
	}
}

module.exports = Gateway;
