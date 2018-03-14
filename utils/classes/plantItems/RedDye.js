module.exports = class RedDye {
	constructor() {
		this.name = 'Red dye';
		this.cost = 10;
		this.description = 'Red dye really makes your plant red.';
	}
	use(plant, msg) {
		plant.getPlantData().activeSeed.red = Math.min((plant.getPlantData().activeSeed.red + Math.floor(Math.random() * 60)), 255);
		return msg.say('Your plant turns more red. :sparkles:');
	}
};
