module.exports = async function(client, opts) {
	return client.shard.broadcastEval(`
		try {
			[this.users.get('${opts.id}').username, this.users.get('${opts.id}').discriminator, ${opts.id}];
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
