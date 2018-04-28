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
		return new Promise((resolve, reject) => {
			this.pending[gcmd.time] = {data: new Array(gcmd.totalDestinations).fill(undefined), resolve: resolve, reject: reject};
			process.send(gcmd);
		});
	}

	async processMessage(gcmd) {
		// Response handler
		if (gcmd.command == 'response') { // If recieving data from a command
			const thisCommand = this.pending[gcmd.time].data;
			thisCommand[gcmd.source] = gcmd.payload;
			if (thisCommand.some((d) => d === undefined)) return; // Returns if the responses are not all here yet.
			this.pending[gcmd.time].resolve(thisCommand);
			return delete this.pending[gcmd.time];
		}

		// Response sender
		this.commands[gcmd.command](this.client, gcmd.payload).then(data => {
			process.send(new GatewayCommand(
				this.client.shard.count,
				this.client.shard.id,
				'response',
				[gcmd.source],
				data,
				gcmd.time,
			));
		}).catch(e => {
			process.send(new GatewayCommand(
				this.client.shard.count,
				this.client.shard.id,
				'response',
				[gcmd.source],
				null,
				gcmd.time,
			));
		});
	}
}

module.exports = Gateway;
