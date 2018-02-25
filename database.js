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
			operatorsAliases: false,
		});
	}

	start(shardID) {
		this.db.authenticate()
			.then(() => console.log(`[Shard ${shardID}] Connected to database!`))
			.catch((err) => console.log(err));
	}
}

module.exports = new AeiouDatabase();
