module.exports = class WaterTray {
	constructor() {
		this.name = 'Water tray';
		this.cost = 75;
		this.description = 'Prevents your plant from being overwatered. Has a chance to break on use.';
	}

	use(plant, msg) {
		return msg.say('The water tray is automatically applied. It wont last forever, so check back often.');
	}
};
