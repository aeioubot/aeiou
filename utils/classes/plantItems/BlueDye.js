module.exports = class BlueDye {
	constructor() {
		this.name = 'Blue dye';
		this.cost = 10;
		this.description = 'Bring some blue to your plant.';
	}

	use(plant, msg, itemNumber) {
		plant.getPlantData().activeSeed.blue = Math.min((plant.getPlantData().activeSeed.blue + Math.floor(Math.random() * 30)+60), 255);
		plant.removeFromInventory(itemNumber);
		return msg.say('Your plant turns more blue, but it isn\'t sad. :sparkles:');
	}
};
