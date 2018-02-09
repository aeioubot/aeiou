/*
 * growthRate (int 1-75): the amount (between 0 and growthRate) a plant will grow every tick.
 * leafiness: (0-100): the amount of leaves that're dropped when the plant is harvested.
 * sleepChance: (0-75): percent chance the plant will fall asleep every hour
 * waterAffinity (-20-20): the percent increase that the growthRate will experience when this plant is watered
 */


class Plant {
	constructor(user, plantData) {
		this.plantData = plantData;
		this.user = user;
	}
	async tick() {
		if (this.plantData.progress == 100 || !this.plantData.activeSeed) return;
		this.plantData.progress += this.grow(this.activeSeed.growthRate);
		if (this.plantData.progress > 100) this.plantData.progress = 100;
	}

	grow(growthRate) {
		return Math.max((Math.floor(Math.random() * growthRate)), 3);
	}

	async addToSeeds(seed) {
		if (this.plantData.seeds.length >= 10) throw new Error("You can only have up to 10 seeds at once.");
		this.plantData.seeds.push(seed);
	}

	getPlantData() {
		return this.plantData;
	}
}

module.exports = Plant;
