module.exports = async function(client, id) {
	return client.shard.broadcastEval(`
		try {
			[this.users.get('${id}').username, this.users.get('${id}').discriminator, ${id}];
		} catch (e) {
			null;
		}
	`).then((data) => {
		for (let i = 0; i < data.length; i++) {
			if (data[i]) return data[i];
		}
		return null;
	});
};
