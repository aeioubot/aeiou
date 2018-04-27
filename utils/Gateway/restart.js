module.exports = async function(client, payload) {
	setTimeout(() => {
		console.log(`[Shard ${client.shard.id}] Restarting...`);
		process.exit(0);
	}, client.shard.id * 4000);
};
