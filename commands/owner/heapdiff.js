const {Command} = require('discord.js-commando');
const mem = require('memwatch-next');

module.exports = class ReplyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'heap',
			group: 'owner',
			memberName: 'heap',
			description: 'starts/stops a heapdiff',
		});
	}

	hasPermission(msg) {
		if (this.client.isOwner(msg.author)) return true;
		return 'please don\'t.';
	}

	async run(msg, args) {
		if (!this.memwatch) {
			this.memwatch = new mem.HeapDiff();
			return;
		}
		global.heapD = this.memwatch.end();
		delete this.memwatch;
		return;
	}
};
