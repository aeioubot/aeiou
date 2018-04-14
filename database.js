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

	async start(shardID) {
		await this.db.authenticate();
		this.db.sync()
			.then(() => console.log(`[Shard ${shardID}] Connected to database!`))
			.catch((err) => console.log(err));
	}
}

module.exports = new AeiouDatabase();
