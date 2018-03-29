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
}

module.exports = Gateway;
