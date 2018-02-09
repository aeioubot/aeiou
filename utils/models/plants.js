const Sequelize = require('sequelize');
const Database = require('../../database.js');
const Plant = require('../classes/plant.js');

const db = Database.db;

const userPlants = db.define('userPlants', {
	user: {
		// eslint-disable-next-line
		type: Sequelize.STRING(25),
		unique: true,
	},
	data: {
		type: Sequelize.TEXT,
		defaultValue: '{"progress":null,"activeSeed":null,"seeds":[],"inventory":[]}',
	},
}, {timestamps: false, charset: "utf8mb4"});

module.exports = {
	getPlant: async function(msg) {
		return userPlants.findOrCreate({
			where: {
				user: msg.author.id,
			},
		}).then(returnedData => JSON.parse(returnedData[0].dataValues.data));
	},
	getAllPlants: async function() {
		return userPlants.findAll().then(plants => {
			plantClasses = plants.map((plantData) => {
				return new Plant(plantData.dataValues.user, JSON.parse(plantData.dataValues.data));
			});
			return plantClasses;
		});
	},
	storePlant: async function(plantClass) {
		if (x.constructor.name !== "Plant") throw new Error("The argument provided to store a plant must be an instance of the Plant class.");
		return userPlants.upsert({
			user: plantClass.user,
			data: JSON.stringify(plantData),
		});
	},
	storeAllPlants: async function(plantClasses) {
		if (x.constructor.name !== "Plant") throw new Error("The argument provided to store a plant must be an instance of the Plant class.");
		plantClasses.forEach((plant) => {
			return userPlants.upsert({
				user: plant.user,
				data: JSON.stringify(plant.plantData),
			});
		});
	},
};
