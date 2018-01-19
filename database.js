const Sequelize = require('sequelize');
const secure = require('./secure.json');
const database = new Sequelize('vowels', 'root', secure.dbPassword, {
	dialect: 'mysql',
	port: 3306,
	host: 'localhost',
	provider: 'mysql',
});

class Database {
	static get db() {
		return database;
	}
	static start() {
		database.authenticate()
			.then(() => console.info('Connection to database has been established successfully.'))
			.then(() => console.info('Synchronizing database...'))
			.then(() => database.sync()
				.then(() => console.info('Synchronizing database done!'))
				.catch((e) => console.error(`Error synchronizing the database: ${e}`))
			)
			.then(() => console.log('Connected to database!'))
			.catch((e) => console.log(e));
	}
}

module.exports = Database;
