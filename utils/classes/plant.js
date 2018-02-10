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
		if (this.plantData.progress === 100 || !this.plantData.activeSeed) return;
		const watered = this.plantData.activeSeed.watered; // How can I do this without an extra variable?
		const growth = this.grow(this.plantData.activeSeed.growthRate);
		this.plantData.progress += growth;
		this.plantData.activeSeed.lastEvent = `Your plant has grown ${growth}% taller${watered ? ", consuming its water in the process" : ""}.`;
		if (this.plantData.progress > 100) this.plantData.progress = 100;
	}

	grow(growthRate) {
		const waterMultiplier = this.plantData.activeSeed.watered ? 1.2 : 1;
		this.plantData.activeSeed.watered = false;
		return Math.max((Math.floor(Math.random() * this.plantData.activeSeed.growthRate * waterMultiplier)), 3);
	}

	async addToSeeds(seed) {
		if (this.plantData.seeds.length >= 10) return {success: false, seeds: this.plantData.seeds.length};
		this.plantData.seeds.push(seed);
		return {success: true, seeds: this.plantData.seeds.length};
	}

	getPlantData() {
		return this.plantData;
	}

	async plant(index) {
		const toPlant = this.plantData.seeds[index];
		if (!toPlant) return {success: false};
		this.plantData.activeSeed = this.plantData.seeds.splice(index, 1)[0];
		this.plantData.activeSeed.watered = false;
		this.plantData.progress = 0;
		this.plantData.activeSeed.lastEvent = "This seed was just planted.";
		return {success: true};
	}

	async harvest() {
		if (!this.plantData.activeSeed) return {success: false, leaves: null};
		const returnObject = {
			success: true,
			grown: this.plantData.progress == 100,
			leaves: this.plantData.progress == 100 ? Math.floor(Math.random() * this.plantData.activeSeed.leafiness) : 0,
		};
		this.plantData.activeSeed = null;
		this.plantData.leaves += returnObject.leaves;
		return returnObject;
	}
}

module.exports = Plant;
