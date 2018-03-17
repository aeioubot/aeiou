const Sequelize = require('sequelize');
const Database = require('../../database.js');
const Plant = require('../classes/Plant.js');

const db = Database.db;

const userPlants = db.define('userPlants', {
	user: {
		// eslint-disable-next-line
		type: Sequelize.STRING(25),
		unique: true,
	},
	data: {
		type: Sequelize.TEXT,
		defaultValue: '{"progress":null,"activeSeed":null,"leaves":0,"inventory":[],"seeds":[]}',
	},
}, {timestamps: false, charset: 'utf8mb4'});

module.exports = {
	getPlant: async function(msgOrID) {
		if (msgOrID.author) {
			return userPlants.findOrCreate({
				where: {
					user: msgOrID.author.id,
				},
			}).then((plant) => new Plant(plant[0].dataValues.user, JSON.parse(plant[0].dataValues.data)));
		}
		return userPlants.findOrCreate({
			where: {
				user: msgOrID,
			},
		}).then((plant) => new Plant(plant[0].dataValues.user, JSON.parse(plant[0].dataValues.data)));
	},
	getAllPlants: async function() {
		return userPlants.findAll().then((plants) => {
			plantClasses = plants.map((plantData) => new Plant(plantData.dataValues.user, JSON.parse(plantData.dataValues.data)));
			return plantClasses;
		});
	},
	storePlant: async function(plantClass) {
		if (plantClass.constructor.name !== 'Plant') throw new Error('The argument provided to store a plant must be an instance of the Plant class.');
		return userPlants.upsert({
			user: plantClass.user,
			data: JSON.stringify(plantClass.getPlantData()),
		});
	},
	storeAllPlants: async function(plantClasses) {
		plantClasses.forEach((plant) => {
			if (plant.constructor.name !== 'Plant') throw new Error('The argument provided to store a plant must be an instance of the Plant class.');
			return userPlants.upsert({
				user: plant.user,
				data: JSON.stringify(plant.getPlantData()),
			});
		});
	},
	startTimer: async function() {
		const tickPlants = () => {
			return this.getAllPlants().then((plantClasses) => {
				plantClasses.forEach((plant) => plant.tick());
				this.storeAllPlants(plantClasses);
			});
		};
		tickPlants();
		setInterval(() => {
			tickPlants();
			console.log('All plants ticked!');
		}, 3600000);
	},
	testTick: async function() {
		return this.getAllPlants().then((plantClasses) => {
			plantClasses.forEach((plant) => {
				plant.tick();
			});
			this.storeAllPlants(plantClasses);
		});
	},
};
