const Sequelize = require('sequelize');
const secure = require('./secure.json');

class AeiouDatabase {
	constructor() {
		this.db = new Sequelize('vowels', 'root', secure.dbPassword, {
			dialect: 'mysql',
			port: 3306,
			host: 'localhost',
			provider: 'mysql',
			logging: false,
		});
	}

	start() {
		this.db.authenticate()
			.then(() => console.info('Connection to database has been established successfully.'))
			.then(() => console.info('Synchronizing database...'))
			.then(() => this.db.sync()
				.then(() => console.info('Synchronizing database done!'))
				.catch((error) => console.error(`Error synchronizing the database: ${error}`))
			)
			.then(() => console.log('Connected to database!'))
			.catch((err) => console.log(err));
	}
}

module.exports = new AeiouDatabase();
