module.exports = class GreenDye {
	constructor() {
		this.name = 'Green dye';
		this.cost = 10;
		this.description = 'Grow some more green on your plant.';
	}

	use(plant, msg, itemNumber) {
		plant.getPlantData().activeSeed.green = Math.min((plant.getPlantData().activeSeed.green + Math.floor(Math.random() * 60)), 255);
		plant.removeFromInventory(itemNumber);
		return msg.say('Your plant grows more green. :sparkles:');
	}
};
