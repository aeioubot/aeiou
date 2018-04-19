const GatewayCommand = require('../classes/GatewayCommand.js');

class Gateway {
	constructor(client) {
		this.pending = {};
		this.client = client;
		this.commands = require('require-all')({
			dirname: __dirname,
			filter: (n) => n == 'Gateway.js' ? false : n.slice(0, -3),
		});
	}

	sendMessage(gcmd) {
		if (!gcmd instanceof GatewayCommand) throw new Error('A gateway command must use the GatewayCommand class.');
		this.pending[gcmd.time] = new Promise();
		return this.pending[gcmd.time];
	}

	async processMessage(m) {
		try {
			process.send(new GatewayCommand(
				this.client.shard.id,
				'response',
				m.source,
				await this.commands[m.command](this.client, m.payload),
				m.time,
			));
		} catch (e) {
			process.send(new GatewayCommand(
				this.client.shard.id,
				'response',
				m.source,
				e,
				m.time,
			));
		}
	}
}

module.exports = Gateway;
