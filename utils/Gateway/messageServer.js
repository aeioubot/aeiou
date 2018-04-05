module.exports = async function(client, opts) {
	return client.shard.broadcastEval(`
	try {
		this.guilds.get('${opts.guild}')
		.channels.get('${opts.channel}')
		.send('${opts.msg}', JSON.parse('${JSON.stringify(opts.msgOpts) || {}}'));
		true;
	} catch (e) {
		false;
	}
	`).then((res) => {
		return res.some((b) => b);
	});
};
