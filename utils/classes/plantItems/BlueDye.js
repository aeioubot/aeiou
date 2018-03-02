module.exports = class BlueDye {
	constructor() {
		this.name = 'Blue dye';
		this.cost = 10;
		this.description = 'Bring some blue to your plant.';
	}

	use(plant) {
		return plant.getPlantData().activeSeed.blue = Math.min((plant.getPlantData().activeSeed.blue + Math.floor(Math.random() * 30)+60), 255);
	}
};
