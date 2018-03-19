module.exports = class DrainagePot {
	constructor() {
		this.name = 'Drainage pot';
		this.cost = 75;
		this.description = 'Prevents your plant from being overwatered. Has a chance to break on use.';
	}

	use(plant, msg, itemNumber) {
		msg.say('The drainage pot is automatically applied. It wont last forever, so check back often.');
	}
};
