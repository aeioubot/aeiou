/**
 * newMessage TODO:
 * -send embed to owners
 * -
 */
const TOTAL_CACHE_COUNT = 10;

class DmManager {
	constructor(client) {
		this.client = client;
		this.messages = [];
		this.id = 0;
	}

	async newMessage(msg) {
		if (this.messages.push(msg) > TOTAL_CACHE_COUNT) this.messages.splice(0, 1);
	}
}

module.exports = DmManager;
